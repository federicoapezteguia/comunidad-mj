<?php
// ============================================================
// Formulario de contacto de Comunidad FAN Marcos Juárez.
// Guarda cada mensaje en el hosting y avisa por correo.
// Si el correo falla, el mensaje igual queda guardado.
// ============================================================
declare(strict_types=1);

date_default_timezone_set('America/Argentina/Cordoba');

const CT_DESTINO      = 'fede@comunidad.fan';
const CT_REMITENTE    = 'no-responder@comunidadfanmj.com.ar';
const CT_SITIO        = 'Comunidad FAN Marcos Juárez';
const CT_MAX_POR_HORA = 5;      // mensajes por IP
const CT_MIN_SEGUNDOS = 3;      // menos que esto es un robot

$MOTIVOS = [
    'radio'      => 'Mensaje para la radio',
    'publicidad' => 'Publicidad',
    'correccion' => 'Corrección sobre una nota',
    'otro'       => 'Otro',
];

/** Carpeta privada para los mensajes, fuera de la web si el hosting lo permite. */
function ct_dir(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    $raiz = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
    $candidatos = [];
    if ($raiz !== '') $candidatos[] = dirname($raiz) . '/comunidad-mj-contacto';
    $candidatos[] = __DIR__ . '/.datos-contacto';
    foreach ($candidatos as $c) {
        if (is_dir($c) || @mkdir($c, 0750, true)) {
            if (is_writable($c)) {
                if (strpos($c, '.datos-contacto') !== false && !is_file("$c/.htaccess")) {
                    @file_put_contents("$c/.htaccess", "Require all denied\nDeny from all\n");
                }
                if (!is_file("$c/index.html")) @file_put_contents("$c/index.html", '');
                return $dir = $c;
            }
        }
    }
    return $dir = sys_get_temp_dir();
}

function ct_ip(): string {
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

/** Cuenta los envíos recientes de una IP y registra el actual. */
function ct_demasiados(): bool {
    $archivo = ct_dir() . '/.ritmo.json';
    $ahora = time();
    $f = fopen($archivo, 'c+');
    if (!$f) return false;
    flock($f, LOCK_EX);
    $crudo = stream_get_contents($f);
    $datos = json_decode($crudo ?: '[]', true);
    if (!is_array($datos)) $datos = [];
    $clave = hash('sha256', ct_ip());
    $propios = array_values(array_filter($datos[$clave] ?? [], fn($t) => $ahora - $t < 3600));
    $pasado = count($propios) >= CT_MAX_POR_HORA;
    if (!$pasado) $propios[] = $ahora;
    $datos[$clave] = $propios;
    foreach ($datos as $k => $v) {
        $v = array_values(array_filter($v, fn($t) => $ahora - $t < 3600));
        if ($v) $datos[$k] = $v; else unset($datos[$k]);
    }
    ftruncate($f, 0); rewind($f);
    fwrite($f, json_encode($datos));
    flock($f, LOCK_UN); fclose($f);
    return $pasado;
}

function ct_guardar(array $m): void {
    $archivo = ct_dir() . '/mensajes-' . date('Y-m') . '.jsonl';
    $f = fopen($archivo, 'a');
    if (!$f) return;
    flock($f, LOCK_EX);
    fwrite($f, json_encode($m, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    flock($f, LOCK_UN); fclose($f);
}

function ct_enviar(array $m): bool {
    $asunto = sprintf('[%s] %s de %s', CT_SITIO, $m['motivo'], $m['nombre']);
    $cuerpo = "Nuevo mensaje desde el formulario del sitio.\n\n"
        . "Nombre:  {$m['nombre']}\n"
        . "Correo:  {$m['email']}\n"
        . "Motivo:  {$m['motivo']}\n"
        . ($m['whatsapp'] !== '' ? "WhatsApp: {$m['whatsapp']}\n" : '')
        . ($m['enlace'] !== ''   ? "Nota:    {$m['enlace']}\n"   : '')
        . "Fecha:   {$m['fecha']}\n\n"
        . "Mensaje:\n{$m['mensaje']}\n";
    $cabeceras = [
        'From: ' . CT_SITIO . ' <' . CT_REMITENTE . '>',
        'Reply-To: ' . $m['nombre'] . ' <' . $m['email'] . '>',
        'Content-Type: text/plain; charset=UTF-8',
        'MIME-Version: 1.0',
        'X-Mailer: PHP/' . phpversion(),
    ];
    return @mail(CT_DESTINO, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, implode("\r\n", $cabeceras));
}

// ------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /contacto/', true, 303);
    exit;
}

$ajax = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
$errores = [];

$nombre  = trim((string)($_POST['nombre'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$motivo  = (string)($_POST['motivo'] ?? 'otro');
$mensaje = trim((string)($_POST['mensaje'] ?? ''));
$whats   = trim((string)($_POST['whatsapp'] ?? ''));
$enlace  = trim((string)($_POST['enlace'] ?? ''));
$trampa  = trim((string)($_POST['sitio_web'] ?? ''));   // campo oculto
$desde   = (int)($_POST['abierto'] ?? 0);

if ($nombre === '')                       $errores['nombre']  = 'Escribí tu nombre.';
elseif (mb_strlen($nombre) > 80)          $errores['nombre']  = 'El nombre es demasiado largo.';
if ($email === '')                        $errores['email']   = 'Escribí tu correo para que podamos responderte.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errores['email'] = 'Ese correo no parece válido.';
if ($mensaje === '')                      $errores['mensaje'] = 'Contanos de qué se trata.';
elseif (mb_strlen($mensaje) < 10)         $errores['mensaje'] = 'El mensaje es muy corto.';
elseif (mb_strlen($mensaje) > 4000)       $errores['mensaje'] = 'El mensaje es demasiado largo.';
if (!isset($MOTIVOS[$motivo]))            $motivo = 'otro';

// Un robot completa todos los campos, incluso el que está escondido,
// y manda el formulario apenas carga la página.
$robot = $trampa !== '' || ($desde > 0 && (time() - $desde) < CT_MIN_SEGUNDOS);

if (!$errores && !$robot && ct_demasiados()) {
    $errores['general'] = 'Recibimos varios mensajes tuyos en la última hora. Probá más tarde.';
}

$ok = false;
if (!$errores && !$robot) {
    $m = [
        'fecha'   => date('d/m/Y H:i'),
        'nombre'  => $nombre,
        'email'   => $email,
        'motivo'  => $MOTIVOS[$motivo],
        'whatsapp'=> mb_substr($whats, 0, 30),
        'enlace'  => filter_var($enlace, FILTER_VALIDATE_URL) ? $enlace : '',
        'mensaje' => $mensaje,
        'ip'      => hash('sha256', ct_ip()),
    ];
    ct_guardar($m);
    ct_enviar($m);       // si falla el correo, el mensaje ya quedó guardado
    $ok = true;
} elseif ($robot) {
    $ok = true;          // al robot no se le explica nada
}

if ($ajax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'errores' => $errores], JSON_UNESCAPED_UNICODE);
    exit;
}

// Sin JavaScript: página de respuesta
$titulo = $ok ? 'Mensaje enviado' : 'Revisá el formulario';
$texto  = $ok
    ? 'Gracias por escribirnos. Te vamos a responder al correo que dejaste.'
    : implode(' ', $errores);
header('Content-Type: text/html; charset=utf-8');
?><!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title><?= htmlspecialchars($titulo) ?> · <?= CT_SITIO ?></title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1.25rem;color:#16131c;line-height:1.6}
h1{color:#2d005d;font-size:1.6rem}a{color:#b000b0}</style></head>
<body><h1><?= htmlspecialchars($titulo) ?></h1><p><?= htmlspecialchars($texto) ?></p>
<p><a href="/contacto/">Volver a Contacto</a> · <a href="/">Ir a la portada</a></p></body></html>
