<?php
// TEMPORAL: compara el hash que PHP devuelve al incluir el archivo contra el que
// realmente tiene el archivo en disco. Si difieren, el servidor guarda en memoria
// una version vieja (OPcache). No muestra la contrasena.
declare(strict_types=1);
if (($_GET['t'] ?? '') !== '94f57eea76234318d0eebbbf') { http_response_code(404); exit; }
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

$f = __DIR__ . '/config.php';
$porRequire = (string) ((require $f)['hash'] ?? '');

$texto = (string) file_get_contents($f);
preg_match("/'hash'\\s*=>\\s*'([^']*)'/", $texto, $m);
$enDisco = $m[1] ?? '';

$est = function_exists('opcache_get_status') ? @opcache_get_status(false) : null;
$invalidado = false;
if ($porRequire !== $enDisco && function_exists('opcache_invalidate')) {
    $invalidado = (bool) @opcache_invalidate($f, true);
}

echo json_encode([
  'huella_require'   => substr(md5($porRequire), 0, 16),
  'huella_en_disco'  => substr(md5($enDisco), 0, 16),
  'coinciden'        => hash_equals($porRequire, $enDisco),
  'largo_require'    => strlen($porRequire),
  'largo_en_disco'   => strlen($enDisco),
  'modificado'       => date('c', (int) filemtime($f)),
  'opcache_activo'   => is_array($est) ? ($est['opcache_enabled'] ?? null) : 'sin datos',
  'cache_invalidada' => $invalidado,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
