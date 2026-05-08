<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq";
$base_url = "https://panel.astralwiki.com/items/";

// Función para llamar a Directus
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

$accion = $_GET['accion'] ?? 'eventos';

switch ($accion) {
    
    case 'eventos':
        // 1. Obtener el fin de versión
        $fin_version_data = fetchDirectus($base_url . "events?filter[title][_eq]=fin_version&fields=end_time&limit=1");
        $fin_version = !empty($fin_version_data) ? $fin_version_data[0]['end_time'] : null;

        // 2. Obtener todos los eventos (menos el marcador de fin_version)
        $eventos_raw = fetchDirectus($base_url . "events?filter[title][_neq]=fin_version");

        $ahora = date('Y-m-d H:i:s');
        $eventos_procesados = [];

        foreach ($eventos_raw as $evento) {
            $start = $evento['start_time'];
            $end = $evento['end_time'];
            $status = 'finalizado'; // Valor por defecto

            if ($ahora >= $start && $ahora <= $end) {
                $status = 'activo';
            } elseif ($ahora < $start && $start <= $fin_version) {
                $status = 'proximamente';
            } elseif ($ahora < $start && $start > $fin_version) {
                $status = 'anunciado';
            }

            $evento['status'] = $status;
            $eventos_procesados[] = $evento;
        }

        // 3. Ordenar: Activos primero, luego por fecha de inicio
        usort($eventos_procesados, function($a, $b) {
            if ($a['status'] === 'activo' && $b['status'] !== 'activo') return -1;
            if ($a['status'] !== 'activo' && $b['status'] === 'activo') return 1;
            return strcmp($a['start_time'], $b['start_time']);
        });

        echo json_encode([
            "eventos" => $eventos_procesados,
            "fin_version" => $fin_version
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'codes':
        // Filtramos en la tabla general los que empiecen por code_
        $codigos = fetchDirectus($base_url . "general?filter[name][_contains]=code_");
        echo json_encode($codigos, JSON_UNESCAPED_UNICODE);
        break;

    case 'featured_characters':
        // Filtramos personajes destacados
        $featured = fetchDirectus($base_url . "general?filter[name][_contains]=character_");
        $nombres = array_column($featured, 'values');
        echo json_encode($nombres, JSON_UNESCAPED_UNICODE);
        break;

    case 'version':
        // Obtenemos la versión actual
        $version_data = fetchDirectus($base_url . "general?filter[name][_eq]=version&limit=1");
        if (!empty($version_data)) {
            echo json_encode(["version" => $version_data[0]['values']], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["error" => "No se encontró la versión"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode(["error" => "Acción no válida."]);
        break;
}
?>