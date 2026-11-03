<?php
// API pública de la encuesta: GET devuelve la encuesta activa; POST registra un voto.
declare(strict_types=1);
require __DIR__ . '/_encuestas.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder(int $codigo, array $cuerpo): void {
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    $d = enc_leer();
    $activas = array_values(array_filter($d['encuestas'], fn($e) => $e['activa']));
    if (!$activas) responder(200, ['encuesta' => null]);
    $e = end($activas);
    $votado = isset($_COOKIE['enc_' . $e['id']]);
    responder(200, ['encuesta' => enc_publica($e, $votado, $votado)]);
}

if ($metodo !== 'POST') responder(405, ['error' => 'Método no permitido']);

// Solo se aceptan votos enviados desde el propio sitio
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origen !== '' && parse_url($origen, PHP_URL_HOST) !== ($_SERVER['HTTP_HOST'] ?? '')) {
    responder(403, ['error' => 'Origen no permitido']);
}

$entrada = json_decode((string) file_get_contents('php://input'), true);
$id = is_array($entrada) ? (string) ($entrada['id'] ?? '') : '';
$opcion = is_array($entrada) && isset($entrada['opcion']) ? (int) $entrada['opcion'] : -1;
if (!preg_match('/^[a-z0-9]{6,20}$/', $id)) responder(400, ['error' => 'Encuesta inválida']);

$res = enc_con_bloqueo(function (array $d) use ($id, $opcion) {
    $i = null;
    foreach ($d['encuestas'] as $k => $e) if ($e['id'] === $id) $i = $k;
    if ($i === null) return ['codigo' => 404, 'cuerpo' => ['error' => 'La encuesta no existe']];
    $e = $d['encuestas'][$i];
    if (!$e['activa']) return ['codigo' => 409, 'cuerpo' => ['error' => 'La encuesta está cerrada', 'encuesta' => enc_publica($e, true, true)]];

    if (isset($_COOKIE['enc_' . $id])) return ['codigo' => 200, 'cuerpo' => ['encuesta' => enc_publica($e, true, true)]];
    if ($opcion < 0 || $opcion >= count($e['opciones'])) return ['codigo' => 400, 'cuerpo' => ['error' => 'Opción inválida']];

    // Límite por conexión (se guarda solo un código irreversible, no la IP)
    $archivoIps = enc_dir() . "/ips-$id.json";
    $ips = is_file($archivoIps) ? (json_decode((string) file_get_contents($archivoIps), true) ?: []) : [];
    $hash = enc_ip_hash($d['sal'], $id);
    if (($ips[$hash] ?? 0) >= ENC_MAX_VOTOS_POR_IP) {
        return ['codigo' => 200, 'cuerpo' => ['encuesta' => enc_publica($e, true, true), 'aviso' => 'Ya se registraron votos desde esta conexión']];
    }
    $ips[$hash] = ($ips[$hash] ?? 0) + 1;
    file_put_contents($archivoIps, json_encode($ips));

    $d['encuestas'][$i]['opciones'][$opcion]['votos']++;
    $f = fopen(enc_dir() . "/votos-$id.csv", 'a');
    fputcsv($f, [date('c'), $e['opciones'][$opcion]['texto']]);
    fclose($f);

    $e = $d['encuestas'][$i];
    return ['__guardar' => $d, '__respuesta' => ['codigo' => 200, 'cuerpo' => ['encuesta' => enc_publica($e, true, true)], 'cookie' => true]];
});

if (!empty($res['cookie'])) {
    setcookie('enc_' . $id, '1', ['expires' => time() + ENC_COOKIE_DIAS * 86400, 'path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}
responder($res['codigo'], $res['cuerpo']);
