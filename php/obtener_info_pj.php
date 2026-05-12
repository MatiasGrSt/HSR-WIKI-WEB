<?php
// --- SISTEMA DE SEGURIDAD CORS (Lista VIP) ---
$dominios_permitidos = [
    'https://www.astralwiki.com', // Tu dominio principal
    'https://astralwiki.com',     // Tu dominio sin www
    'http://localhost:4321',      // Entorno de desarrollo local (Astro)
    'http://127.0.0.1:4321'       // Entorno de desarrollo alternativo
];

// Comprobamos de dónde viene la petición
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';

// Si viene de uno de nuestros dominios, le abrimos la puerta
if (in_array($origen, $dominios_permitidos)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Si el navegador solo está haciendo una pregunta de seguridad (Preflight), 
// cortamos aquí para no gastar recursos de tu servidor
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
// ---------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// 1. Recogemos los datos que nos manda JS
$personaje = $_GET['personaje'] ?? ''; 
$tipo = $_GET['tipo'] ?? '';
$skill_id = $_GET['skill_id'] ?? ''; 

// 2. CONECTAMOS CON LA CAJA FUERTE (Fase 1)
$config = require __DIR__ . '/config.php';
$token = $config['directus_token'];
$base_url = $config['directus_url']; 

// ==========================================
// 3. SISTEMA DE CACHÉ (Lectura ultra rápida)
// ==========================================
$carpeta_cache = __DIR__ . '/cache/';
if (!is_dir($carpeta_cache)) {
    mkdir($carpeta_cache, 0777, true); // Crea la carpeta si no existe
}

// Creamos un nombre de archivo seguro usando MD5 (Ej: cache_a1b2c3d4.json)
$nombre_archivo = 'cache_' . md5($personaje . $tipo . $skill_id) . '.json';
$ruta_cache = $carpeta_cache . $nombre_archivo;

// ¡MAGIA! Si el archivo ya existe, lo escupimos en 5 milisegundos y nos vamos.
if (file_exists($ruta_cache)) {
    echo file_get_contents($ruta_cache);
    exit; 
}
// ==========================================

// 4. FUNCIONES Y LLAMADAS A DIRECTUS (Solo llega aquí si no hay caché)
function fetchDirectus($coleccion, $filtro_campo, $filtro_valor, $orden = '') {
    global $token, $base_url;
    $url = $base_url . $coleccion . "?filter[" . $filtro_campo . "][_eq]=" . urlencode($filtro_valor);
    if ($orden !== '') $url .= "&sort=" . $orden;
    $opciones = ["http" => ["header" => "Authorization: Bearer " . $token . "\r\n"]];
    $respuesta = @file_get_contents($url, false, stream_context_create($opciones));
    if ($respuesta === FALSE) return [];
    return json_decode($respuesta, true)['data'] ?? [];
}

switch($tipo) {
    case 'all':
        $resBasic = fetchDirectus('characters', 'name', $personaje);
        if (empty($resBasic)) die(json_encode(["error" => "Personaje no encontrado."]));
        
        $resSkills = fetchDirectus('skills', 'character_id', $personaje);
        $resEidolons = fetchDirectus('eidolons', 'character_id', $personaje, 'lvl');
        $resTraces = fetchDirectus('traces', 'character_id', $personaje);
        $resTracesMi = fetchDirectus('traces_mi', 'character_id', $personaje);

        $finalData = [
            "info" => $resBasic[0], 
            "skills" => $resSkills,
            "eidolons" => $resEidolons,
            "major_traces" => $resTraces,
            "minor_traces" => $resTracesMi
        ];
        break;

    case 'skill_levels':
        $resLevels = fetchDirectus('skill_levels', 'skill_id', $skill_id);
        $finalData = $resLevels; 
        break;

    default:
        die(json_encode(["error" => "Tipo de información no válido."]));
}

$json_final = json_encode($finalData, JSON_UNESCAPED_UNICODE);

// ==========================================
// 5. SISTEMA DE CACHÉ (Guardado automático)
// ==========================================
// Guardamos los datos para que el siguiente usuario no tenga que esperar
file_put_contents($ruta_cache, $json_final);

// Devolvemos los datos
echo $json_final;
?>