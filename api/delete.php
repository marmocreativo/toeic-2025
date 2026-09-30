<?php
// public_html/api/delete.php

header('Content-Type: application/json');

$config = require __DIR__ . '/../../config-uploads.php';

function respond($success, $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode(array_merge(['success' => $success], $data));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, ['error' => 'Método no permitido'], 405);
}

$headers = getallheaders();
$token = $headers['X-Upload-Token'] ?? '';

if (!hash_equals($config['upload_token'], $token)) {
    respond(false, ['error' => 'No autorizado'], 401);
}

// --- Recibe el path relativo (ej: "sliders/imagen-xxxxx.jpg") ---
$input = json_decode(file_get_contents('php://input'), true);
$relativePath = $input['path'] ?? '';

if (!$relativePath) {
    respond(false, ['error' => 'Falta el parámetro path'], 400);
}

// --- Seguridad: evitar path traversal (../../) ---
if (strpos($relativePath, '..') !== false) {
    respond(false, ['error' => 'Ruta no válida'], 400);
}

// --- Validar que empiece con un bucket permitido ---
$bucketsPermitidos = ['centros', 'general', 'examenes', 'sliders'];
$primerSegmento = explode('/', $relativePath)[0];

if (!in_array($primerSegmento, $bucketsPermitidos, true)) {
    respond(false, ['error' => 'Bucket no válido'], 400);
}

$fullPath = $config['buckets_path'] . '/' . $relativePath;

// --- Verificar que el archivo esté realmente dentro de buckets_path (defensa extra) ---
$realBase = realpath($config['buckets_path']);
$realTarget = realpath($fullPath);

if ($realTarget === false || strpos($realTarget, $realBase) !== 0) {
    respond(false, ['error' => 'Archivo no encontrado'], 404);
}

if (!file_exists($fullPath)) {
    respond(false, ['error' => 'Archivo no encontrado'], 404);
}

if (!unlink($fullPath)) {
    respond(false, ['error' => 'No se pudo eliminar el archivo'], 500);
}

respond(true, ['message' => 'Archivo eliminado']);