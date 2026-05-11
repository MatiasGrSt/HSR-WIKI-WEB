<?php
header('Content-Type: application/json; charset=utf-8');

// (Aquí pondrías tus cabeceras CORS habituales)

$token = "GOTW0iUyBua4MUf8g8ojTKr2fQGZnxLq"; // Asegúrate de que el token sea el correcto
// Llamamos a tu tabla exacta: "tier_list"
$url = "https://panel.astralwiki.com/items/tier_list?limit=-1"; 

$opciones = [
    "http" => ["header" => "Authorization: Bearer " . $token]
];
$contexto = stream_context_create($opciones);
$respuesta = file_get_contents($url, false, $contexto);

if ($respuesta === FALSE) {
    die(json_encode(["error" => "No se pudo conectar con Directus."]));
}

$datos = json_decode($respuesta, true)['data'] ?? [];
echo json_encode($datos, JSON_UNESCAPED_UNICODE);
?>