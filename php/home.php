<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Pedimos la contraseña al servidor. Si el servidor no nos la da (porque estamos en local), usamos una de prueba.
$db_pass = getenv('DB_PASSWORD') ?: "tu_contraseña_local"; 

// Hacemos la conexión usando esa variable
$conn = new mysqli("srv-captain--wiki-db", "root", $db_pass, "hsr_wiki");

if ($conn->connect_error) {
    die(json_encode(["error" => "Conexión fallida: " . $conn->connect_error]));
}

// QUITAMOS el (int) para que acepte palabras como 'version'
$accion = isset($_GET['accion']) ? $_GET['accion'] : 'eventos';

// Buscamos el fin_version usando 'title' (según tu imagen)
$sql_config = "SELECT end_time FROM events WHERE title = 'fin_version' LIMIT 1";
$res_config = $conn->query($sql_config);
if ($res_config && $res_config->num_rows > 0) {
    $row_config = $res_config->fetch_assoc();
    $fin_version = $row_config['end_time']; 
}

switch ($accion) {
    
    case 'eventos':
        // Cambiamos a 'start_time' y 'title' según tu imagen
        $sql = "SELECT *, 
                CASE 
                    WHEN NOW() BETWEEN start_time AND end_time THEN 'activo'
                    WHEN NOW() < start_time AND start_time <= '$fin_version' THEN 'proximamente'
                    WHEN NOW() < start_time AND start_time > '$fin_version' THEN 'anunciado'
                END AS status 
                FROM events 
                WHERE title != 'fin_version'
                ORDER BY status = 'activo' DESC, start_time ASC";

        $result = $conn->query($sql);
        $eventos = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $eventos[] = $row;
            }
        }
        echo json_encode([
            "eventos" => $eventos,
            "fin_version" => $fin_version
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'codes':
        $sql_codes = "SELECT * FROM general WHERE name LIKE 'code_%'";
        $res_codes = $conn->query($sql_codes);
        $codigos = [];
        if ($res_codes && $res_codes->num_rows > 0) {
            while($row = $res_codes->fetch_assoc()) {
                $codigos[] = $row;
            }
        }
        echo json_encode($codigos, JSON_UNESCAPED_UNICODE);
        break;

    case 'featured_characters':
        $sql_chars = "SELECT `values` FROM general WHERE name LIKE 'character_%'";
        $res_chars = $conn->query($sql_chars);
        $personajes = [];
        if ($res_chars && $res_chars->num_rows > 0) {
            while($row = $res_chars->fetch_assoc()) {
                $personajes[] = $row['values'];
            }
        }
        echo json_encode($personajes, JSON_UNESCAPED_UNICODE);
        break;

    case 'version':
        $sql_version = "SELECT `values` FROM general WHERE name = 'version' LIMIT 1";
        $res_version = $conn->query($sql_version);
        if ($res_version && $res_version->num_rows > 0) {
            $row_version = $res_version->fetch_assoc();
            echo json_encode(["version" => $row_version['values']], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["error" => "No se encontró la versión"], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode(["error" => "Acción no válida. Usa eventos, codes o version"]);
        break;
}

$conn->close();
?>