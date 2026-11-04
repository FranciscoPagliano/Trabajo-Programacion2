<?php
// Ejecutar una vez desde consola después de importar database/schema.sql.
$host=getenv('EMPRESA_DB_HOST')?:'127.0.0.1';
$name=getenv('EMPRESA_DB_NAME')?:'empresa_demo';
$dbUser=getenv('EMPRESA_DB_USER')?:'root';
$dbPass=getenv('EMPRESA_DB_PASS')?:'';
$pdo=new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$dbUser,$dbPass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
$email='admin@empresa.local';
$password=getenv('EMPRESA_ADMIN_PASSWORD')?:'Admin123!';
$st=$pdo->prepare('SELECT id FROM usuarios WHERE email=?');
$st->execute([$email]);
if($st->fetch()){echo "Ya existe el usuario $email.\n";exit;}
$hash=password_hash($password,PASSWORD_DEFAULT);
$st=$pdo->prepare("INSERT INTO usuarios(nombre,email,password_hash,rol) VALUES('Administración',?,?,'admin')");
$st->execute([$email,$hash]);
echo "Administrador creado: $email\nContraseña inicial: $password\nCambiála luego de ingresar.\n";
