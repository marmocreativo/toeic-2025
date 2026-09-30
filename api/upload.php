<?php
// public_html/api/upload.php

header('Content-Type: application/json');

// --- Cargar configuración (fuera de public_html) ---
$config = require __DIR__ . '/../../config-uploads.php';

function respond($success, $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode(array_merge(['success' => $success], $data));
    exit;
}

// --- Solo POST ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, ['error' => 'Método no permitido'], 405);
}

// --- Validar token ---
$headers = getallheaders();
$token = $headers['X-Upload-Token'] ?? '';

if (!hash_equals($config['upload_token'], $token)) {
    respond(false, ['error' => 'No autorizado'], 401);
}

// --- Validar bucket ---
$bucketsPermitidos = ['centros', 'general', 'examenes', 'sliders'];
$bucket = $_POST['bucket'] ?? '';

if (!in_array($bucket, $bucketsPermitidos, true)) {
    respond(false, ['error' => 'Bucket no válido'], 400);
}

// --- Reglas por bucket: extensiones y tamaño máximo (bytes) ---
$reglas = [
    'centros'   => ['ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif'], 'max' => 5 * 1024 * 1024],
    'sliders'   => ['ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif'], 'max' => 5 * 1024 * 1024],
    'examenes'  => ['ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp3', 'wav', 'ogg', 'm4a', 'pdf'], 'max' => 50 * 1024 * 1024],
    'general'   => ['ext' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'], 'max' => 10 * 1024 * 1024],
];

// --- Validar que llegó el archivo ---
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    respond(false, ['error' => 'No se recibió archivo válido'], 400);
}

$file = $_FILES['file'];
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$reglaBucket = $reglas[$bucket];

// --- Validar extensión ---
if (!in_array($extension, $reglaBucket['ext'], true)) {
    respond(false, ['error' => "Tipo de archivo no permitido para '$bucket'. Permitidos: " . implode(', ', $reglaBucket['ext'])], 400);
}

// --- Validar tamaño ---
if ($file['size'] > $reglaBucket['max']) {
    $maxMb = $reglaBucket['max'] / 1024 / 1024;
    respond(false, ['error' => "Archivo demasiado grande. Máximo {$maxMb}MB para '$bucket'"], 400);
}

// --- Subcarpeta opcional (ej: editor-images, anuncios, extras) ---
$subfolder = $_POST['subfolder'] ?? '';
$subfolder = preg_replace('/[^a-z0-9\-]/i', '', $subfolder); // sanitizar

// --- Generar nombre único (mismo patrón que StorageService.generateFileName) ---
$baseName = pathinfo($file['name'], PATHINFO_FILENAME);
$baseName = strtolower(preg_replace('/[^a-z0-9]/i', '-', $baseName));
$timestamp = round(microtime(true) * 1000);
$random = substr(bin2hex(random_bytes(4)), 0, 6);
$prefix = $_POST['prefix'] ?? '';
$prefix = preg_replace('/[^a-z0-9\-]/i', '', $prefix);

$fileName = ($prefix ? $prefix . '-' : '') . "{$baseName}-{$timestamp}-{$random}.{$extension}";

// --- Construir ruta destino ---
$relativePath = $subfolder ? "$bucket/$subfolder/$fileName" : "$bucket/$fileName";
$destPath = $config['buckets_path'] . '/' . $relativePath;

// --- Crear carpeta destino si no existe ---
$destDir = dirname($destPath);
if (!is_dir($destDir)) {
    mkdir($destDir, 0755, true);
}

// --- Mover archivo ---
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    respond(false, ['error' => 'Error al guardar el archivo en el servidor'], 500);
}

// --- Responder con la URL pública ---
$publicUrl = $config['buckets_base_url'] . '/' . $relativePath;

respond(true, [
    'url' => $publicUrl,
    'path' => $relativePath,
]);