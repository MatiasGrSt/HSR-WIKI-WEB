<?php
// Conectamos a la caja fuerte para saber la contraseña
$config = require __DIR__ . '/config.php';

// Recogemos la contraseña de la URL
$token_recibido = $_GET['token'] ?? '';

// Si la contraseña no coincide, bloqueamos el acceso
if ($token_recibido !== $config['webhook_secret']) {
    die("Acceso denegado. Contraseña incorrecta.");
}

$carpeta_cache = __DIR__ . '/cache/';

// Buscamos todos los archivos .json y los borramos
$archivos = glob($carpeta_cache . '*.json');
if ($archivos !== false) {
    foreach ($archivos as $archivo) {
        if(is_file($archivo)) {
            unlink($archivo);
        }
    }
}

echo "¡Éxito! Toda la caché antigua ha sido eliminada.";
?> 