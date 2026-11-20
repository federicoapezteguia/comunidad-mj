<?php
// TEMPORAL: comprueba qué archivo de configuración está usando el servidor.
// No muestra la contraseña ni el hash: solo su huella, para comparar con el repositorio.
// Se borra apenas termine la revisión.
declare(strict_types=1);
if (($_GET['t'] ?? '') !== '94f57eea76234318d0eebbbf') { http_response_code(404); exit; }
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
$f = __DIR__ . '/config.php';
$c = is_file($f) ? require $f : [];
$h = (string) ($c['hash'] ?? '');
echo json_encode([
  'existe'       => is_file($f),
  'modificado'   => is_file($f) ? date('c', (int) filemtime($f)) : null,
  'bytes'        => is_file($f) ? filesize($f) : null,
  'usuario'      => (string) ($c['usuario'] ?? ''),
  'hash_largo'   => strlen($h),
  'hash_prefijo' => substr($h, 0, 7),
  'hash_huella'  => $h === '' ? null : substr(md5($h), 0, 16),
  'php'          => PHP_VERSION,
  'opcache'      => function_exists('opcache_get_status') ? 'disponible' : 'no',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
