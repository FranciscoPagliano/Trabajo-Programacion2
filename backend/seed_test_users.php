<?php
// Crea o actualiza las cuentas de demostración categoría 0 a 11.
// Definí EMPRESA_TEST_PASSWORD antes de ejecutarlo; en MySQL solo se guarda el hash.
$host = getenv('EMPRESA_DB_HOST') ?: '127.0.0.1';
$name = getenv('EMPRESA_DB_NAME') ?: 'empresa_demo';
$dbUser = getenv('EMPRESA_DB_USER') ?: 'root';
$dbPass = getenv('EMPRESA_DB_PASS') ?: '';
$password = getenv('EMPRESA_TEST_PASSWORD') ?: '';

if (strlen($password) < 12) {
    fwrite(STDERR, "Definí EMPRESA_TEST_PASSWORD con al menos 12 caracteres.\n");
    exit(1);
}

$pdo = new PDO(
    "mysql:host=$host;dbname=$name;charset=utf8mb4",
    $dbUser,
    $dbPass,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
);
$st = $pdo->prepare(
    "INSERT INTO usuarios(nombre,email,password_hash,rol,categoria,activo)
     VALUES(?,?,?,?,?,1)
     ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),password_hash=VALUES(password_hash),
       rol=VALUES(rol),categoria=VALUES(categoria),activo=1"
);

for ($categoria = 0; $categoria <= 11; $categoria++) {
    $email = sprintf('prueba.cat%02d@empresa.local', $categoria);
    $nombre = sprintf('Usuario de prueba categoría %d', $categoria);
    $rol = $categoria >= 10 ? 'admin' : 'usuario';
    $st->execute([$nombre, $email, password_hash($password, PASSWORD_DEFAULT), $rol, $categoria]);
    printf("Categoría %2d: %s\n", $categoria, $email);
}

echo "Contraseña definida por EMPRESA_TEST_PASSWORD; MySQL almacena únicamente los hashes.\n";
