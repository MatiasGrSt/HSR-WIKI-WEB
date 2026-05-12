<?php
// --- ESCUDO ANTI-ERRORES ---
ini_set('display_errors', 0);
error_reporting(0);

// --- SISTEMA DE SEGURIDAD CORS (Lista VIP) ---
$dominios_permitidos = [
    'https://www.astralwiki.com',
    'https://astralwiki.com',    
    'http://localhost:4321',      
    'http://127.0.0.1:4321'       
];

$origen = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origen, $dominios_permitidos)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
// ---------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// 1. Recogemos los datos que nos manda JS
$personaje = $_GET['personaje'] ?? ''; 
$tipo = $_GET['tipo'] ?? '';
$skill_id = $_GET['skill_id'] ?? ''; 

// 2. CONECTAMOS CON LA CAJA FUERTE (config.php)
$config = require __DIR__ . '/config.php';
$token = $config['directus_token'];
$base_url = $config['directus_url']; 

// 3. FUNCIONES Y LLAMADAS A DIRECTUS (Sin sistema de caché)
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

// Generamos el JSON final
$json_final = json_encode($finalData, JSON_UNESCAPED_UNICODE);

// 4. DEVOLVEMOS LOS DATOS DIRECTAMENTE (¡Aquí hemos borrado el file_put_contents!)
echo $json_final;
?>