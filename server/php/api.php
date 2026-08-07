<?php
// Simple PHP API example (server/php/api.php)
// This script expects environment variables for DB connection (use .env or server config)
// Provides two endpoints: GET /api.php?action=rooms and POST /api.php?action=msg to insert

header('Content-Type: application/json');

$dsn = getenv('DB_DSN') ?: 'mysql:host=127.0.0.1;dbname=theotokos;charset=utf8mb4';
$dbuser = getenv('DB_USER') ?: 'root';
$dbpass = getenv('DB_PASS') ?: '';

try{
  $pdo = new PDO($dsn, $dbuser, $dbpass, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
}catch(Exception $e){ http_response_code(500); echo json_encode(['error'=>'db_connect','msg'=>$e->getMessage()]); exit; }

$action = $_GET['action'] ?? '';

if($action==='rooms'){
  $stmt = $pdo->query('SELECT id, name, description FROM rooms ORDER BY name');
  $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rooms);
  exit;
}

if($action==='msg' && $_SERVER['REQUEST_METHOD']==='POST'){
  $input = json_decode(file_get_contents('php://input'), true);
  if(!$input) { http_response_code(400); echo json_encode(['error'=>'invalid_json']); exit; }
  $room = $input['room'] ?? null; $author = $input['author'] ?? 'Anonyme'; $text = $input['text'] ?? '';
  if(!$room || !$text){ http_response_code(400); echo json_encode(['error'=>'missing']); exit; }
  $stmt = $pdo->prepare('INSERT INTO messages (room_name, author, text, ts) VALUES (?, ?, ?, ?)');
  $stmt->execute([$room, $author, $text, time()*1000]);
  echo json_encode(['ok'=>true]); exit;
}

http_response_code(400);
echo json_encode(['error'=>'unknown_action']);
