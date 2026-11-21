<?php
// Panel privado de encuestas: crear, activar, cerrar, ver resultados y descargar votos.
declare(strict_types=1);
require __DIR__ . '/_encuestas.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; form-action 'self'");

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$usuarioOk = (string) ($config['usuario'] ?? '');
$hashOk = (string) ($config['hash'] ?? '');

session_name('enc_admin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
$csrf = $_SESSION['csrf'];

// ---------- Intentos de ingreso (bloqueo tras 5 fallos en 15 minutos) ----------
function intentos(bool $sumar = false): int {
    $f = enc_dir() . '/.intentos.json';
    $d = is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
    $clave = hash('sha256', 'login|' . ($_SERVER['REMOTE_ADDR'] ?? ''));
    $ahora = time();
    $lista = array_values(array_filter($d[$clave] ?? [], fn($t) => $t > $ahora - 900));
    if ($sumar) { $lista[] = $ahora; $d[$clave] = $lista; file_put_contents($f, json_encode($d)); }
    return count($lista);
}

$mensaje = '';
$accion = $_POST['accion'] ?? '';

if ($accion === 'salir') { session_destroy(); header('Location: admin.php'); exit; }

if ($accion === 'entrar') {
    if ($hashOk === '') {
        $mensaje = 'El panel todavía no tiene contraseña configurada.';
    } elseif ((string) ($_POST['clave'] ?? '') === '') {
        $mensaje = 'Escribí la contraseña.';
    } elseif (intentos() >= 5) {
        $mensaje = 'Demasiados intentos. Probá de nuevo en 15 minutos.';
    } elseif (hash_equals($usuarioOk, (string) ($_POST['usuario'] ?? '')) && password_verify((string) ($_POST['clave'] ?? ''), $hashOk)) {
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        header('Location: admin.php'); exit;
    } else {
        intentos(true);
        $mensaje = 'Usuario o contraseña incorrectos.';
    }
}

$logueado = !empty($_SESSION['ok']);

// ---------- Descarga de votos en CSV ----------
if ($logueado && isset($_GET['csv']) && preg_match('/^[a-z0-9]{6,20}$/', (string) $_GET['csv'])) {
    $id = (string) $_GET['csv'];
    $d = enc_leer();
    $e = null;
    foreach ($d['encuestas'] as $x) if ($x['id'] === $id) $e = $x;
    if (!$e) { http_response_code(404); exit('No existe'); }
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="encuesta-' . $id . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Pregunta', $e['pregunta']], ';');
    fputcsv($out, [], ';');
    fputcsv($out, ['Opción', 'Votos', 'Porcentaje'], ';');
    $total = array_sum(array_map(fn($o) => $o['votos'], $e['opciones']));
    foreach ($e['opciones'] as $o) fputcsv($out, [$o['texto'], $o['votos'], $total ? round($o['votos'] * 100 / $total, 1) . '%' : '0%'], ';');
    fputcsv($out, ['Total', $total], ';');
    fputcsv($out, [], ';');
    fputcsv($out, ['Fecha y hora del voto', 'Opción elegida'], ';');
    $f = enc_dir() . "/votos-$id.csv";
    if (is_file($f) && ($in = fopen($f, 'r'))) {
        while (($fila = fgetcsv($in)) !== false) fputcsv($out, $fila, ';');
        fclose($in);
    }
    exit;
}

// ---------- Registro de lecturas ----------
function lecturas(): array {
    $d = is_file(enc_dir() . '/visitas.json') ? (json_decode((string) file_get_contents(enc_dir() . '/visitas.json'), true) ?: []) : [];
    $indice = is_file(__DIR__ . '/notas.json') ? (json_decode((string) file_get_contents(__DIR__ . '/notas.json'), true) ?: []) : [];
    $desde = date('Y-m-d', strtotime('-6 days'));
    $hoy = date('Y-m-d');
    $filas = [];
    $dias = [];
    foreach ($d as $dia => $notas) {
        if ($dia < $desde) continue;
        $dias[$dia] = 0;
        foreach ($notas as $id => $n) {
            $filas[$id]['total'] = ($filas[$id]['total'] ?? 0) + $n;
            $filas[$id]['hoy'] = ($filas[$id]['hoy'] ?? 0) + ($dia === $hoy ? $n : 0);
            $dias[$dia] += $n;
        }
    }
    foreach ($filas as $id => $f) {
        $filas[$id]['titulo'] = $indice[$id]['titulo'] ?? $id;
        $filas[$id]['url'] = $indice[$id]['url'] ?? '';
        $filas[$id]['volanta'] = $indice[$id]['volanta'] ?? '';
    }
    uasort($filas, fn($a, $b) => $b['total'] <=> $a['total']);
    krsort($dias);
    return [$filas, $dias];
}

if ($logueado && isset($_GET['lecturas']) && $_GET['lecturas'] === 'csv') {
    [$filas] = lecturas();
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="lecturas-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Puesto', 'Título', 'Sección', 'Lecturas (7 días)', 'Lecturas de hoy', 'Dirección'], ';');
    $i = 0;
    foreach ($filas as $f) {
        $i++;
        fputcsv($out, [$i, $f['titulo'], $f['volanta'], $f['total'], $f['hoy'], $f['url']], ';');
    }
    exit;
}

// ---------- Acciones del panel ----------
if ($logueado && $accion !== '' && $accion !== 'entrar') {
    if (!hash_equals($csrf, (string) ($_POST['csrf'] ?? ''))) { http_response_code(403); exit('Sesión vencida, recargá la página.'); }
    $id = (string) ($_POST['id'] ?? '');
    $mensaje = enc_con_bloqueo(function (array $d) use ($accion, $id) {
        if ($accion === 'crear') {
            $pregunta = trim((string) ($_POST['pregunta'] ?? ''));
            $ops = array_values(array_filter(array_map('trim', explode("\n", (string) ($_POST['opciones'] ?? ''))), 'strlen'));
            if ($pregunta === '' || count($ops) < 2 || count($ops) > 8) return 'Escribí la pregunta y entre 2 y 8 opciones (una por renglón).';
            $activar = !empty($_POST['activar']);
            if ($activar) foreach ($d['encuestas'] as &$e) $e['activa'] = false;
            unset($e);
            $d['encuestas'][] = [
                'id' => substr(bin2hex(random_bytes(8)), 0, 10),
                'pregunta' => mb_substr($pregunta, 0, 200),
                'opciones' => array_map(fn($t) => ['texto' => mb_substr($t, 0, 100), 'votos' => 0], $ops),
                'activa' => $activar,
                'creada' => date('c'),
            ];
            return ['__guardar' => $d, '__respuesta' => $activar ? 'Encuesta creada y publicada en el sitio.' : 'Encuesta creada (sin publicar).'];
        }
        foreach ($d['encuestas'] as $k => $e) {
            if ($e['id'] !== $id) continue;
            if ($accion === 'activar') {
                foreach ($d['encuestas'] as $j => $x) $d['encuestas'][$j]['activa'] = ($j === $k);
                return ['__guardar' => $d, '__respuesta' => 'Encuesta publicada. Las demás quedaron cerradas.'];
            }
            if ($accion === 'cerrar') {
                $d['encuestas'][$k]['activa'] = false;
                $d['encuestas'][$k]['cerrada'] = date('c');
                return ['__guardar' => $d, '__respuesta' => 'Encuesta cerrada: ya no se muestra en el sitio.'];
            }
            if ($accion === 'borrar') {
                array_splice($d['encuestas'], $k, 1);
                @unlink(enc_dir() . "/votos-$id.csv");
                @unlink(enc_dir() . "/ips-$id.json");
                return ['__guardar' => $d, '__respuesta' => 'Encuesta borrada.'];
            }
        }
        return 'No se encontró la encuesta.';
    });
}

$datos = $logueado ? enc_leer() : ['encuestas' => []];
?><!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Panel · Comunidad FAN Marcos Juárez</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  :root { --f: #ff00ff; --v: #2d005d; --a: #ffcc33; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Montserrat, system-ui, sans-serif; background: #fafafa; color: #1d1d1d; }
  header { background: var(--v); color: #fff; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  header b { color: var(--a); }
  main { max-width: 900px; margin: 0 auto; padding: 24px 16px 60px; }
  h1 { font-size: 20px; margin: 0; } h2 { color: var(--v); font-size: 18px; margin: 32px 0 12px; }
  .caja { background: #fff; border: 1px solid #e6dcf3; border-radius: 12px; padding: 18px; margin-bottom: 16px; }
  label { display: block; font-weight: 700; font-size: 14px; margin: 10px 0 6px; color: var(--v); }
  input[type=text], input[type=password], textarea { width: 100%; padding: 10px 12px; border: 1px solid #cbb8e6; border-radius: 8px; font: inherit; }
  textarea { min-height: 110px; }
  button, .btn { display: inline-block; border: 0; border-radius: 999px; padding: 9px 16px; font: inherit; font-weight: 800; font-size: 13px; cursor: pointer; text-decoration: none; }
  .pri { background: var(--a); color: var(--v); } .sec { background: #efe6fb; color: var(--v); } .peligro { background: #fde3e7; color: #b0102a; }
  .msg { background: #fff6d6; border: 1px solid #f1d27a; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
  .estado { font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; }
  .on { background: #e3152f; color: #fff; } .off { background: #ddd; color: #555; }
  .fila { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
  .barra { background: #f0e9fa; border-radius: 6px; height: 24px; position: relative; margin: 6px 0; overflow: hidden; }
  .barra span { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, var(--f), var(--a)); }
  .barra em { position: relative; z-index: 1; font-style: normal; font-size: 13px; font-weight: 700; padding-left: 8px; line-height: 24px; }
  .preg { font-weight: 800; font-size: 17px; margin: 8px 0; color: var(--v); }
  .chico { font-size: 12px; color: #666; }
  form.inline { display: inline; }
  .tabla { width: 100%; border-collapse: collapse; font-size: 14px; }
  .tabla th { text-align: left; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #777; border-bottom: 2px solid #e6dcf3; padding: 0 8px 8px; }
  .tabla td { border-bottom: 1px solid #f0ebf8; padding: 10px 8px; vertical-align: top; }
  .tabla .num { text-align: right; white-space: nowrap; }
  .tabla .pos { color: #999; font-weight: 800; width: 28px; }
  .tabla tr:first-child .pos { color: var(--f); }
  .tabla a { color: var(--v); font-weight: 700; text-decoration: none; }
  .tabla a:hover { color: #b000b0; text-decoration: underline; }
  .vol { display: block; font-size: 10px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; color: #b000b0; }
  .dia { display: inline-block; margin-right: 12px; }
</style>
</head>
<body>
<header><h1><b>Panel</b> · Comunidad FAN Marcos Juárez</h1>
<?php if ($logueado): ?><form method="post" class="inline"><input type="hidden" name="accion" value="salir"><button class="sec">Salir</button></form><?php endif; ?>
</header>
<main>
<?php if ($mensaje): ?><div class="msg"><?= h($mensaje) ?></div><?php endif; ?>

<?php if (!$logueado): ?>
  <div class="caja" style="max-width:380px;margin:40px auto">
    <form method="post" autocomplete="on">
      <input type="hidden" name="accion" value="entrar">
      <label for="u">Usuario</label><input id="u" type="text" name="usuario" autocomplete="username" required>
      <label for="c">Contraseña</label><input id="c" type="password" name="clave" autocomplete="current-password" required>
      <div class="fila"><button class="pri">Entrar</button></div>
    </form>
  </div>
<?php else: ?>
  <?php [$filas, $dias] = lecturas(); $totalSemana = array_sum($dias); ?>
  <h2>Lecturas de los últimos 7 días</h2>
  <div class="caja">
    <?php if (!$filas): ?>
      <p class="chico">Todavía no hay lecturas registradas. El contador empieza a sumar cuando alguien abre una nota.</p>
    <?php else: ?>
      <p class="chico">Se cuenta una lectura por nota, por navegador y por día. Total de la semana: <b><?= $totalSemana ?></b> lecturas.</p>
      <table class="tabla">
        <thead><tr><th>#</th><th>Nota</th><th class="num">7 días</th><th class="num">Hoy</th></tr></thead>
        <tbody>
          <?php $i = 0; foreach ($filas as $f): $i++; ?>
            <tr>
              <td class="pos"><?= $i ?></td>
              <td>
                <?php if ($f['volanta']): ?><span class="vol"><?= h($f['volanta']) ?></span><?php endif; ?>
                <?php if ($f['url']): ?><a href="<?= h($f['url']) ?>" target="_blank" rel="noopener"><?= h($f['titulo']) ?></a><?php else: ?><?= h($f['titulo']) ?><?php endif; ?>
              </td>
              <td class="num"><b><?= (int) $f['total'] ?></b></td>
              <td class="num"><?= (int) $f['hoy'] ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
      <div class="fila">
        <a class="btn sec" href="admin.php?lecturas=csv">Descargar registro (Excel/CSV)</a>
      </div>
      <p class="chico" style="margin-top:14px">Por día: <?php foreach ($dias as $dia => $n): ?><span class="dia"><?= h(date('d/m', strtotime($dia))) ?>: <b><?= $n ?></b></span><?php endforeach; ?></p>
    <?php endif; ?>
  </div>

  <h2>Nueva encuesta</h2>
  <div class="caja">
    <form method="post">
      <input type="hidden" name="accion" value="crear"><input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <label for="p">Pregunta</label><input id="p" type="text" name="pregunta" maxlength="200" required placeholder="¿Qué obra te parece más urgente para Marcos Juárez?">
      <label for="o">Opciones (una por renglón, entre 2 y 8)</label><textarea id="o" name="opciones" required placeholder="Pavimento&#10;Iluminación&#10;Cloacas"></textarea>
      <label style="font-weight:600"><input type="checkbox" name="activar" value="1" checked> Publicarla en el sitio ahora (cierra la que esté activa)</label>
      <div class="fila"><button class="pri">Crear encuesta</button></div>
    </form>
  </div>

  <h2>Encuestas</h2>
  <?php if (!$datos['encuestas']): ?><p class="chico">Todavía no hay encuestas.</p><?php endif; ?>
  <?php foreach (array_reverse($datos['encuestas']) as $e):
    $total = array_sum(array_map(fn($o) => $o['votos'], $e['opciones'])); ?>
    <div class="caja">
      <span class="estado <?= $e['activa'] ? 'on' : 'off' ?>"><?= $e['activa'] ? 'Publicada' : 'Cerrada' ?></span>
      <span class="chico"> · creada el <?= h(date('d/m/Y H:i', strtotime($e['creada']))) ?> · <?= $total ?> votos</span>
      <p class="preg"><?= h($e['pregunta']) ?></p>
      <?php foreach ($e['opciones'] as $o): $pct = $total ? round($o['votos'] * 100 / $total) : 0; ?>
        <div class="barra"><span style="width:<?= $pct ?>%"></span><em><?= h($o['texto']) ?> — <?= $pct ?>% (<?= (int) $o['votos'] ?>)</em></div>
      <?php endforeach; ?>
      <div class="fila">
        <a class="btn sec" href="admin.php?csv=<?= h($e['id']) ?>">Descargar votos (Excel/CSV)</a>
        <?php foreach (($e['activa'] ? ['cerrar' => 'Cerrar'] : ['activar' => 'Publicar']) + ['borrar' => 'Borrar'] as $acc => $txt): ?>
          <form method="post" class="inline" <?= $acc === 'borrar' ? 'onsubmit="return confirm(\'¿Borrar la encuesta y todos sus votos?\')"' : '' ?>>
            <input type="hidden" name="accion" value="<?= $acc ?>"><input type="hidden" name="id" value="<?= h($e['id']) ?>"><input type="hidden" name="csrf" value="<?= h($csrf) ?>">
            <button class="<?= $acc === 'borrar' ? 'peligro' : 'sec' ?>"><?= $txt ?></button>
          </form>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endforeach; ?>
<?php endif; ?>
</main>
</body>
</html>
