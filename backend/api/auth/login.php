<?php
require_once __DIR__.'/../bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);
$d = jsonBody();
$email = filter_var(trim((string)($d['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$password = (string)($d['password'] ?? '');
if (!$email || $password === '') fail('Email y contraseña son obligatorios.', 422);
$st = db()->prepare('SELECT id,nombre,email,password_hash,categoria FROM usuarios WHERE email=? AND activo=1');
$st->execute([$email]);
$u = $st->fetch();
if (!$u || !password_verify($password, $u['password_hash'])) fail('Email o contraseña incorrectos.', 401);
$categoria = (int)$u['categoria'];
if ($categoria < 0 || $categoria > 11) fail('La categoría de la cuenta no es válida.', 403);
session_regenerate_id(true);
$_SESSION['user_id'] = (int)$u['id'];
$_SESSION['categoria'] = $categoria;
respond([
    'id' => (int)$u['id'],
    'nombre' => $u['nombre'],
    'categoria' => $categoria,
    'rol' => $categoria >= 10 ? 'admin' : 'usuario',
]);
