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
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Si el navegador solo está haciendo una pregunta de seguridad (Preflight), 
// cortamos aquí para no gastar recursos de tu servidor haciendo peticiones a Directus
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
// ---------------------------------------------

header('Content-Type: application/json; charset=utf-8');

// 1. Configuración de la API de Directus
$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq";
$directus_url = "https://panel.astralwiki.com/items/characters";

// 2. Recoger filtros del frontend
$nombre = $_GET['nombre'] ?? '';
$rarezas_raw = $_GET['rarezas'] ?? '';
$elementos_raw = $_GET['elementos'] ?? '';
$vias_raw = $_GET['vias'] ?? '';

// 3. Construir los filtros para Directus (¡Adiós SQL!)
$query_params = [];

// Filtro de Nombre
if ($nombre !== '') {
    $query_params['filter']['name']['_icontains'] = $nombre; // Busca que contenga el nombre
}

// Filtro de Rarezas
if ($rarezas_raw !== '') {
    $map = ["cinco-estrellas" => 5, "cuatro-estrellas" => 4];
    $partes = explode(',', $rarezas_raw);
    $numeros = [];
    foreach($partes as $p) { if(isset($map[$p])) $numeros[] = $map[$p]; }
    
    if(!empty($numeros)) {
        $query_params['filter']['rarity']['_in'] = implode(',', $numeros);
    }
}

// Filtro de Elementos
if ($elementos_raw !== '') {
    $query_params['filter']['element']['_in'] = $elementos_raw;
}

// Filtro de Vías
if ($vias_raw !== '') {
    $query_params['filter']['path']['_in'] = $vias_raw;
}

// 4. Montar la URL final y pedir los datos
// http_build_query transforma nuestro array en algo como "?filter[name][_icontains]=Acheron"
$url_final = $directus_url . "?" . http_build_query($query_params);

// Opciones para enviar el Token por cabecera
$opciones = [
    "http" => [
        "header" => "Authorization: Bearer " . $token . "\r\n"
    ]
];
$contexto = stream_context_create($opciones);

// Hacemos la llamada a Directus
$respuesta = file_get_contents($url_final, false, $contexto);

if ($respuesta === FALSE) {
    die(json_encode(["error" => "No se pudo conectar con Directus."]));
}

// Directus devuelve todo dentro de un objeto "data", lo extraemos
$datos_limpios = json_decode($respuesta, true)['data'] ?? [];

echo json_encode($datos_limpios, JSON_UNESCAPED_UNICODE);
?>