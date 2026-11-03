<?php
// "Lo más leído": POST suma una lectura a una nota; GET devuelve las 5 más leídas de los últimos 7 días.
declare(strict_types=1);
require __DIR__ . '/_encuestas.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

const VIS_DIAS = 7;

function vis_indice(): array {
    $f = __DIR__ . '/notas.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$archivo = enc_dir() . '/visitas.json';

if ($metodo === 'POST') {
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origen !== '' && parse_url($origen, PHP_URL_HOST) !== ($_SERVER['HTTP_HOST'] ?? '')) { http_response_code(403); exit('{}'); }
    $entrada = json_decode((string) file_get_contents('php://input'), true);
    $id = is_array($entrada) ? (string) ($entrada['id'] ?? '') : '';
    $indice = vis_indice();
    if (!preg_match('/^[a-z0-9-]{3,140}$/', $id) || !isset($indice[$id])) { http_response_code(400); exit('{}'); }
    $lock = fopen(enc_dir() . '/.lock-visitas', 'c');
    flock($lock, LOCK_EX);
    $d = is_file($archivo) ? (json_decode((string) file_get_contents($archivo), true) ?: []) : [];
    $hoy = date('Y-m-d');
    $d[$hoy][$id] = ($d[$hoy][$id] ?? 0) + 1;
    // Se guardan solo los últimos días
    $limite = date('Y-m-d', strtotime('-' . (VIS_DIAS + 1) . ' days'));
    foreach (array_keys($d) as $dia) if ($dia < $limite) unset($d[$dia]);
    file_put_contents($archivo . '.tmp', json_encode($d));
    rename($archivo . '.tmp', $archivo);
    flock($lock, LOCK_UN);
    fclose($lock);
    header('Cache-Control: no-store');
    exit('{"ok":true}');
}

// GET: ranking (se puede cachear 5 minutos)
header('Cache-Control: public, max-age=300');
$d = is_file($archivo) ? (json_decode((string) file_get_contents($archivo), true) ?: []) : [];
$desde = date('Y-m-d', strtotime('-' . (VIS_DIAS - 1) . ' days'));
$totales = [];
foreach ($d as $dia => $notas) {
    if ($dia < $desde) continue;
    foreach ($notas as $id => $n) $totales[$id] = ($totales[$id] ?? 0) + $n;
}
arsort($totales);
$indice = vis_indice();
$top = [];
foreach ($totales as $id => $n) {
    if (!isset($indice[$id])) continue;
    $top[] = ['titulo' => $indice[$id]['titulo'], 'url' => $indice[$id]['url'], 'volanta' => $indice[$id]['volanta']];
    if (count($top) === 5) break;
}
echo json_encode(['notas' => $top], JSON_UNESCAPED_UNICODE);
