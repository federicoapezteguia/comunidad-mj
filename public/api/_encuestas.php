<?php
// ============================================================
// Encuestas de Comunidad FAN Marcos Juárez: funciones comunes.
// Los datos se guardan en el propio hosting, en una carpeta privada
// (fuera de la web si se puede; si no, una carpeta oculta y bloqueada).
// ============================================================
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_encuestas.php') { http_response_code(404); exit; }

date_default_timezone_set('America/Argentina/Cordoba');

const ENC_MAX_VOTOS_POR_IP = 5;   // tolera casas u oficinas que comparten conexión
const ENC_COOKIE_DIAS = 365;

function enc_dir(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    $raiz = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
    $candidatos = [];
    if ($raiz !== '') $candidatos[] = dirname($raiz) . '/comunidad-mj-encuestas';
    $candidatos[] = __DIR__ . '/.datos-encuestas';
    foreach ($candidatos as $c) {
        if (is_dir($c) || @mkdir($c, 0750, true)) {
            if (is_writable($c)) {
                if (strpos($c, '.datos-encuestas') !== false && !is_file("$c/.htaccess")) {
                    @file_put_contents("$c/.htaccess", "Require all denied\nDeny from all\n");
                }
                if (!is_file("$c/index.html")) @file_put_contents("$c/index.html", '');
                return $dir = $c;
            }
        }
    }
    http_response_code(500);
    exit('No se pudo crear la carpeta de datos de las encuestas.');
}

/** Ejecuta $fn con el archivo de encuestas bloqueado; si $fn devuelve un array, se guarda. */
function enc_con_bloqueo(callable $fn) {
    $lock = fopen(enc_dir() . '/.lock', 'c');
    flock($lock, LOCK_EX);
    try {
        $datos = enc_leer();
        $res = $fn($datos);
        if (is_array($res) && array_key_exists('__guardar', $res)) {
            enc_escribir($res['__guardar']);
            unset($res['__guardar']);
            $res = $res['__respuesta'] ?? null;
        }
        return $res;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function enc_leer(): array {
    $f = enc_dir() . '/encuestas.json';
    if (!is_file($f)) return ['encuestas' => [], 'sal' => bin2hex(random_bytes(16))];
    $d = json_decode((string) file_get_contents($f), true);
    return is_array($d) ? $d : ['encuestas' => [], 'sal' => bin2hex(random_bytes(16))];
}

function enc_escribir(array $datos): void {
    $f = enc_dir() . '/encuestas.json';
    $tmp = $f . '.tmp';
    file_put_contents($tmp, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    rename($tmp, $f);
}

function enc_ip_hash(string $sal, string $id): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return hash('sha256', $sal . '|' . $id . '|' . $ip);
}

function enc_publica(array $e, bool $conResultados, bool $votado): array {
    $votos = array_map(fn($o) => (int) $o['votos'], $e['opciones']);
    return [
        'id' => $e['id'],
        'pregunta' => $e['pregunta'],
        'opciones' => array_map(fn($o) => $o['texto'], $e['opciones']),
        'votos' => $conResultados ? $votos : null,
        'total' => $conResultados ? array_sum($votos) : null,
        'votado' => $votado,
        'activa' => (bool) $e['activa'],
    ];
}

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
