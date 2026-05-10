<?php
date_default_timezone_set('UTC');
// --- 1. SISTEMA DE SEGURIDAD CORS (Lista VIP) ---
$dominios_permitidos = [
    'https://www.astralwiki.com',
    'https://astralwiki.com',
    'http://localhost:4321',
    'http://127.0.0.1:4321'
];

$origen = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origen, $dominios_permitidos)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

// --- 2. CONFIGURACIÓN DE API ---
$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq";
$base_url = "https://panel.astralwiki.com/items/";

function fetchDirectus($url_final) {
    global $token;
    $opciones = [
        "http" => [
            "header" => "Authorization: Bearer " . $token . "\r\n"
        ]
    ];
    $res = @file_get_contents($url_final, false, stream_context_create($opciones));
    return $res ? json_decode($res, true)['data'] : [];
}

// --- 3. RECOPILACIÓN DE DATOS ---

// A. Obtener Versión Actual
$version_data = fetchDirectus($base_url . "general?filter[name][_eq]=version&limit=1");
$version = !empty($version_data) ? $version_data[0]['values'] : "???";

// B. Obtener Fin de Versión (Marcador especial en la tabla eventos)
$fin_version_data = fetchDirectus($base_url . "events?filter[title][_eq]=fin_version&fields=end_time&limit=1");
$fin_version = !empty($fin_version_data) ? $fin_version_data[0]['end_time'] : null;

// C. Obtener y Procesar Eventos
$eventos_raw = fetchDirectus($base_url . "events?filter[title][_neq]=fin_version");
$ahora = date('Y-m-d H:i:s');
$eventos_procesados = [];

foreach ($eventos_raw as $evento) {
    $start = $evento['start_time'];
    $end = $evento['end_time'];
    
    // Lógica de estados
    if ($ahora >= $start && $ahora <= $end) {
        $status = 'activo';
    } elseif ($ahora < $start && $start <= $fin_version) {
        $status = 'proximamente';
    } elseif ($ahora < $start && $start > $fin_version) {
        $status = 'anunciado';
    } else {
        $status = 'finalizado';
    }

    $evento['status'] = $status;
    $eventos_procesados[] = $evento;
}

// Ordenar eventos: Activos primero, luego por fecha de inicio
usort($eventos_procesados, function($a, $b) {
    if ($a['status'] === 'activo' && $b['status'] !== 'activo') return -1;
    if ($a['status'] !== 'activo' && $b['status'] === 'activo') return 1;
    return strcmp($a['start_time'], $b['start_time']);
});

// D. Obtener Códigos
$codigos = fetchDirectus($base_url . "general?filter[name][_contains]=code_");

// E. Obtener Personajes Destacados
$featured = fetchDirectus($base_url . "general?filter[name][_contains]=character_");
$personajes = array_column($featured, 'values');


// --- DENTRO DE init_home.php ---

// F. Obtener Endgame Activo (Filtramos los que no han terminado)
$endgame_raw = fetchDirectus($base_url . "endgames?filter[end_time][_gt]=" . $ahora . "&sort=end_time");
$endgame_procesado = [];

foreach ($endgame_raw as $eg) {
    // Calculamos si está activo o es el siguiente
    // (A veces hay dos MoC en la lista, mostramos el más cercano a terminar)
    $endgame_procesado[] = $eg;
}

// --- EN EL JSON_ENCODE FINAL AÑADE: ---
echo json_encode([
    "version"       => $version,
    "fin_version"   => $fin_version,
    "eventos"       => $eventos_procesados,
    "codigos"       => $codigos,
    "personajes"    => $personajes,
    "endgame"       => $endgame_procesado, // <--- NUEVO
    "server_time"   => $ahora
], JSON_UNESCAPED_UNICODE);