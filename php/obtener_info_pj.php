<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 1. Recogemos los datos (Añadido skill_id que es el que manda tu JS)
$personaje = $_GET['personaje'] ?? ''; 
$tipo = $_GET['tipo'] ?? '';
$skill_id = $_GET['skill_id'] ?? ''; 

$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq";
$base_url = "https://panel.astralwiki.com/items/";

// Función ayudante para no repetir código al llamar a la API
function fetchDirectus($coleccion, $filtro_campo, $filtro_valor, $orden = '') {
    global $token, $base_url;
    
    $url = $base_url . $coleccion . "?filter[" . $filtro_campo . "][_eq]=" . urlencode($filtro_valor);
    if ($orden !== '') {
        $url .= "&sort=" . $orden;
    }

    $opciones = ["http" => ["header" => "Authorization: Bearer " . $token . "\r\n"]];
    $respuesta = @file_get_contents($url, false, stream_context_create($opciones));
    
    if ($respuesta === FALSE) return [];
    
    return json_decode($respuesta, true)['data'] ?? [];
}

switch($tipo) {
    case 'all':
        // 1. Obtener Info Básica
        $resBasic = fetchDirectus('characters', 'name', $personaje);
        if (empty($resBasic)) {
            die(json_encode(["error" => "Personaje no encontrado en Directus."]));
        }

        // 2. Obtener Skills, Eidolons, Traces...
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
        // OJO: Asumo que en tu tabla 'skill_levels' de Directus, la columna se llama 'skill_id' (relacional). 
        // Si se llama diferente, cambia 'skill_id' por el nombre de tu columna.
        $resLevels = fetchDirectus('skill_levels', 'skill_id', $skill_id);
        
        // Devolvemos el array directamente para que el JS no se confunda
        $finalData = $resLevels; 
        break;

    default:
        die(json_encode(["error" => "Tipo de información no válido."]));
}

echo json_encode($finalData, JSON_UNESCAPED_UNICODE);
?>