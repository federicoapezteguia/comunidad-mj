<?php
// Acceso al panel de encuestas (/api/admin.php).
// Solo se guarda el hash bcrypt de la contraseña, nunca la contraseña.
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'config.php') { http_response_code(404); exit; }
// Clave actualizada: 2026-11-19
return [
    'usuario' => 'fede',
    'hash' => '$2y$12$u2ZimWWmXOzLXNjxXMq02OTH/HXApV7mZi2hc90D6XF.4/jhE1qTa',
];
