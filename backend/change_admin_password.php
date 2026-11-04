<?php
// PowerShell: $env:EMPRESA_ADMIN_PASSWORD='una-clave-larga'; php change_admin_password.php
$password=getenv('EMPRESA_ADMIN_PASSWORD')?:'';
if(strlen($password)<12){fwrite(STDERR,"Definí EMPRESA_ADMIN_PASSWORD con al menos 12 caracteres.\n");exit(1);}
$host=getenv('EMPRESA_DB_HOST')?:'127.0.0.1';$name=getenv('EMPRESA_DB_NAME')?:'empresa_demo';$user=getenv('EMPRESA_DB_USER')?:'root';$pass=getenv('EMPRESA_DB_PASS')?:'';
$pdo=new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$st=$pdo->prepare('UPDATE usuarios SET password_hash=? WHERE email=? AND rol=\'admin\'');
$st->execute([password_hash($password,PASSWORD_DEFAULT),'admin@empresa.local']);
if($st->rowCount()!==1){fwrite(STDERR,"No se encontró el administrador inicial.\n");exit(1);}
echo "Contraseña actualizada.\n";
