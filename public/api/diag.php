<?php
// TEMPORAL: ayuda a ver por qué el panel rechaza el ingreso. No guarda ni muestra la contraseña.
declare(strict_types=1);
if (($_GET['t'] ?? '') !== '94f57eea76234318d0eebbbf') { http_response_code(404); exit; }
header('X-Robots-Tag: noindex, nofollow');
$cfg = require __DIR__ . '/config.php';
$usuarioOk = (string) ($cfg['usuario'] ?? '');
$h = (string) ($cfg['hash'] ?? '');

// 1) ¿Este servidor valida bien un bcrypt conocido?
$pruebaHash = '$2y$12$w3PSyJW7nqx8IIPCZECSfezZY1xjSbUGzPpEQgHI2acC3t4z4STFK';
$autoPrueba = password_verify('prueba-123', $pruebaHash) ? 'OK' : 'FALLA';

$r = null;
if (($_POST['accion'] ?? '') === 'probar') {
    $u = (string) ($_POST['usuario'] ?? '');
    $c = (string) ($_POST['clave'] ?? '');
    $r = [
        'usuario_coincide' => hash_equals($usuarioOk, $u),
        'usuario_tal_cual' => $u,
        'clave_caracteres' => mb_strlen($c, 'UTF-8'),
        'clave_bytes'      => strlen($c),
        'solo_ascii'       => (bool) preg_match('/^[\x20-\x7e]*$/', $c),
        'empieza_mayus'    => (bool) preg_match('/^[A-Z]/', $c),
        'termina_signo'    => str_ends_with($c, '!'),
        'tiene_espacios'   => trim($c) !== $c,
        'entra'            => password_verify($c, $h),
    ];
}
?><!doctype html><meta charset="utf-8"><title>Revisión</title>
<style>body{font:16px system-ui;margin:24px;max-width:640px}input{font:inherit;padding:8px;width:100%;box-sizing:border-box;margin:4px 0 12px}pre{background:#f4f1f8;padding:12px;border-radius:8px;overflow:auto}</style>
<h1>Revisión del ingreso</h1>
<p>bcrypt del servidor: <b><?= $autoPrueba ?></b> · PHP <?= PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION ?></p>
<form method="post">
  <input type="hidden" name="accion" value="probar">
  <label>Usuario</label><input name="usuario" autocomplete="off" autocapitalize="none" spellcheck="false">
  <label>Contraseña</label><input name="clave" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="se ve mientras la escribis">
  <button>Probar</button>
</form>
<?php if ($r !== null): ?><pre><?= htmlspecialchars(json_encode($r, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre><?php endif; ?>
