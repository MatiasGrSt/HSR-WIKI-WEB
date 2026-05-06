<?php
header('Content-Type: application/json; charset=utf-8');
// --- AÑADIR ESTAS LÍNEAS PARA EL CORS ---
header('Access-Control-Allow-Origin: *'); // Permite a cualquier frontend conectarse
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// ----------------------------------------

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 1. Recibimos los parámetros
$personaje = $_GET['personaje'] ?? $_GET['nombre'] ?? ''; 
$skill_id = $_GET['skill_id'] ?? ''; // NUEVO: Parámetro para buscar los niveles por ID de habilidad
$tipo = $_GET['tipo'] ?? ''; // Esto nos dirá qué tabla consultar

// Validamos que al menos uno de los dos datos nos haya llegado
if (empty($personaje) && empty($skill_id)) {
    die(json_encode(["error" => "No se especificó ningún personaje o ID de habilidad."]));
}

if (empty($tipo)) {
    die(json_encode(["error" => "No se especificó el tipo de consulta (info, skills, eidolons, minor_traces, skill_levels)."]));
}

// Pedimos la contraseña al servidor. Si el servidor no nos la da (porque estamos en local), usamos una de prueba.
$db_pass = getenv('DB_PASSWORD') ?: "tu_contraseña_local"; 

// Hacemos la conexión usando esa variable
$conn = new mysqli("srv-captain--wiki-db-db", "root", $db_pass, "hsr_wiki");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión: " . $conn->connect_error]));
}

// Variable para saber qué parámetro inyectar en la consulta (por defecto el personaje)
$parametro_busqueda = $personaje;
$tipo_parametro = "s"; // 's' para string (texto)

// 2. Definimos la consulta SQL basándonos en el parámetro 'tipo'
switch ($tipo) {
    case 'info':
        $sql = "SELECT * FROM characters WHERE name = ?";
        break;
        
    case 'eidolons':
        $sql = "SELECT e.*, c.name AS character_name, c.rarity 
                FROM eidolons e 
                JOIN characters c ON e.character_id = c.name 
                WHERE c.name = ? 
                ORDER BY e.lvl ASC";
        break;
        
    case 'skills':
        $sql = "SELECT e.*, c.name AS character_name
                FROM skills e 
                JOIN characters c ON e.character_id = c.name 
                WHERE c.name = ?";
        break;
        
    case 'minor_traces':
        $sql = "SELECT e.*, c.name AS character_name
                FROM traces_mi e 
                JOIN characters c ON e.character_id = c.name 
                WHERE c.name = ?";
        break;
    
    case 'major_traces':
        $sql = "SELECT e.*, c.name AS character_name
                FROM traces e 
                JOIN characters c ON e.character_id = c.name 
                WHERE c.name = ?";
        break;

    case 'all':
        // 1. Obtener la info básica del personaje
        $stmt = $conn->prepare("SELECT * FROM characters WHERE name = ?");
        $stmt->bind_param("s", $personaje);
        $stmt->execute();
        $resBasic = $stmt->get_result()->fetch_assoc();

        if (!$resBasic) {
            die(json_encode(["error" => "Personaje no encontrado."]));
        }

        // 2. Obtener Skills
        $stmt = $conn->prepare("SELECT * FROM skills WHERE character_id = ?");
        $stmt->bind_param("s", $personaje);
        $stmt->execute();
        $resSkills = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // 3. Obtener Eidolons
        $stmt = $conn->prepare("SELECT * FROM eidolons WHERE character_id = ? ORDER BY lvl ASC");
        $stmt->bind_param("s", $personaje);
        $stmt->execute();
        $resEidolons = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // 4. Obtener Traces (Major)
        $stmt = $conn->prepare("SELECT * FROM traces WHERE character_id = ?");
        $stmt->bind_param("s", $personaje);
        $stmt->execute();
        $resTraces = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // 5. Obtener Traces (Minor)
        $stmt = $conn->prepare("SELECT * FROM traces_mi WHERE character_id = ?");
        $stmt->bind_param("s", $personaje);
        $stmt->execute();
        $resTracesMi = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Construimos el objeto final
        $finalData = [
            "info" => $resBasic,
            "skills" => $resSkills,
            "eidolons" => $resEidolons,
            "major_traces" => $resTraces,
            "minor_traces" => $resTracesMi
        ];

        echo json_encode($finalData, JSON_UNESCAPED_UNICODE);
        exit; // Salimos para que no ejecute el código de abajo del switch

    // --- NUEVO CASO: BUSCAR LOS NIVELES DE HABILIDAD ---
    case 'skill_levels':
        $sql = "SELECT * FROM skill_levels WHERE skill_id = ?";
        $parametro_busqueda = $skill_id; // Cambiamos la búsqueda a la ID de la habilidad
        $tipo_parametro = "i"; // 'i' para integer (número)
        break;
        
    default:
        die(json_encode(["error" => "Tipo de consulta no válido."]));
}

// 3. Preparamos y ejecutamos
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die(json_encode(["error" => "Error en SQL: " . $conn->error]));
}

// Usamos las variables dinámicas para evitar errores si pasamos string vs número
$stmt->bind_param($tipo_parametro, $parametro_busqueda);
$stmt->execute();
$result = $stmt->get_result();

// 4. Procesamos los datos
if ($tipo === 'info') {
    $data = $result->fetch_assoc();
    if (!$data) {
        die(json_encode(["error" => "Personaje no encontrado."]));
    }
} else {
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

// 5. Devolvemos el resultado final
echo json_encode($data, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>