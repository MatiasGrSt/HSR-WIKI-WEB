<?php
header('Content-Type: application/json; charset=utf-8');
// --- AÑADIR ESTAS LÍNEAS PARA EL CORS ---
header('Access-Control-Allow-Origin: *'); // Permite a cualquier frontend conectarse
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// ----------------------------------------

// Pedimos la contraseña al servidor. Si el servidor no nos la da (porque estamos en local), usamos una de prueba.
$db_pass = getenv('DB_PASSWORD') ?: "tu_contraseña_local"; 

// Hacemos la conexión usando esa variable
$conn = new mysqli("srv-captain--wiki-db", "root", $db_pass, "hsr_wiki");

// ...

// 1. IMPORTANTE: Forzar UTF-8 para las tildes
$conn->set_charset("utf8mb4");

// 2. Recoger filtros
$nombre = $_GET['nombre'] ?? '';
$rarezas_raw = $_GET['rarezas'] ?? '';
$elementos_raw = $_GET['elementos'] ?? '';
$vias_raw = $_GET['vias'] ?? '';

$sql = "SELECT * FROM characters WHERE 1=1";

// Filtro de Nombre
if ($nombre !== '') {
    $sql .= " AND name LIKE '%" . $conn->real_escape_string($nombre) . "%'";
}

// Filtro de Rarezas (Mapeo de texto a número)
if ($rarezas_raw !== '') {
    $map = ["cinco-estrellas" => 5, "cuatro-estrellas" => 4];
    $partes = explode(',', $rarezas_raw);
    $numeros = [];
    foreach($partes as $p) { if(isset($map[$p])) $numeros[] = $map[$p]; }
    if(!empty($numeros)) $sql .= " AND rarity IN (" . implode(',', $numeros) . ")";
}

// Filtro de Elementos
if ($elementos_raw !== '') {
    $partes = explode(',', $elementos_raw);
    $clean = array_map(fn($e) => "'" . $conn->real_escape_string($e) . "'", $partes);
    $sql .= " AND element IN (" . implode(',', $clean) . ")";
}

// Filtro de Vías
if ($vias_raw !== '') {
    $partes = explode(',', $vias_raw);
    $clean = array_map(fn($v) => "'" . $conn->real_escape_string($v) . "'", $partes);
    $sql .= " AND path IN (" . implode(',', $clean) . ")";
}

$result = $conn->query($sql);
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);
$conn->close();
?>