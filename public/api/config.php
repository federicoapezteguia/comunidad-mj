<?php
// Acceso al panel de encuestas (/api/admin.php).
// Solo se guarda el hash bcrypt de la contraseña, nunca la contraseña.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') { http_response_code(404); exit; }
// Clave actualizada: 2026-11-19
return [
    'usuario' => 'fede',
    'hash' => '$2y$12$mCuIQ9kYnXTtOLS8Vzx79O/76MWWRYzWhnwgYCrBP38b7s4B5aJue',
];
