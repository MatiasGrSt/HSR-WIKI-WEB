<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$personaje = $_GET['personaje'] ?? $_GET['nombre'] ?? ''; 
$tipo = $_GET['tipo'] ?? '';

if (empty($personaje) || empty($tipo)) {
    die(json_encode(["error" => "Faltan parámetros."]));
}

$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq";
$base_url = "https://panel.astralwiki.com/items/";

// Función ayudante para no repetir código al llamar a la API
function fetchDirectus($coleccion, $filtro_campo, $filtro_valor, $orden = '') {
    global $token, $base_url;
    
    // Construimos la URL. Ejemplo: characters?filter[name][_eq]=Acheron
    $url = $base_url . $coleccion . "?filter[" . $filtro_campo . "][_eq]=" . urlencode($filtro_valor);
    if ($orden !== '') {
        $url .= "&sort=" . $orden;
    }

    $opciones = ["http" => ["header" => "Authorization: Bearer " . $token . "\r\n"]];
    $respuesta = @file_get_contents($url, false, stream_context_create($opciones));
    
    if ($respuesta === FALSE) return [];
    
    return json_decode($respuesta, true)['data'] ?? [];
}

switch ($tipo) {
    case 'all':
        // 1. Obtener Info Básica
        $resBasic = fetchDirectus('characters', 'name', $personaje);
        if (empty($resBasic)) {
            die(json_encode(["error" => "Personaje no encontrado en Directus."]));
        }

        // 2. Obtener Skills, Eidolons, Traces...
        // Filtramos por el character_id (que según tu estructura, guarda el nombre del pj)
        $resSkills = fetchDirectus('skills', 'character_id', $personaje);
        
        // En los eidolons querías ordenarlos por nivel (sort=lvl)
        $resEidolons = fetchDirectus('eidolons', 'character_id', $personaje, 'lvl');
        
        $resTraces = fetchDirectus('traces', 'character_id', $personaje);
        $resTracesMi = fetchDirectus('traces_mi', 'character_id', $personaje);

        $finalData = [
            "info" => $resBasic[0], // Solo el primer objeto, ya que name es único
            "skills" => $resSkills,
            "eidolons" => $resEidolons,
            "major_traces" => $resTraces,
            "minor_traces" => $resTracesMi
        ];

        echo json_encode($finalData, JSON_UNESCAPED_UNICODE);
        break;

    // Puedes añadir el resto de casos (info, skills, eidolons por separado) usando la misma función fetchDirectus()
    default:
        die(json_encode(["error" => "Tipo de consulta no válido o aún no migrado a Directus."]));
}
?>