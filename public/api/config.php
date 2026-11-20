<?php
// Acceso al panel de encuestas (/api/admin.php).
// Solo se guarda el hash bcrypt de la contraseña, nunca la contraseña.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') { http_response_code(404); exit; }
return [
    'usuario' => 'fede',
    'hash' => '$2y$12$pJwXGJuGR1T8460j.v9NU.rNGYbv9uYptuKZLP0sboQG6Wi3xrwaG',
];
