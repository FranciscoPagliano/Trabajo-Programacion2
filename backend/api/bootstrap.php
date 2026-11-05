<?php
declare(strict_types=1);
$origin=$_SERVER['HTTP_ORIGIN']??'';$allowed=['http://localhost:4200','http://127.0.0.1:4200'];
if(in_array($origin,$allowed,true)){header("Access-Control-Allow-Origin: $origin");header('Access-Control-Allow-Credentials: true');header('Vary: Origin');}
header('Access-Control-Allow-Headers: Content-Type');header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');header('Content-Type: application/json; charset=utf-8');
if(($_SERVER['REQUEST_METHOD']??'GET')==='OPTIONS'){http_response_code(204);exit;}
ini_set('session.use_strict_mode','1');session_set_cookie_params(['httponly'=>true,'secure'=>false,'samesite'=>'Lax','path'=>'/']);session_start();
function db():PDO{static $pdo=null;if($pdo instanceof PDO)return $pdo;$host=getenv('EMPRESA_DB_HOST')?:'127.0.0.1';$name=getenv('EMPRESA_DB_NAME')?:'empresa_demo';$user=getenv('EMPRESA_DB_USER')?:'root';$pass=getenv('EMPRESA_DB_PASS')?:'';$pdo=new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);return $pdo;}
function jsonBody():array{$data=json_decode(file_get_contents('php://input'),true);if(!is_array($data))fail('El cuerpo JSON no es válido.',400);return $data;}
function respond(mixed $data,int $status=200):never{http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function fail(string $message,int $status=400):never{respond(['error'=>$message],$status);}
function currentUser():array{if(empty($_SESSION['user_id']))fail('Iniciá sesión para continuar.',401);$st=db()->prepare('SELECT id,nombre,categoria,activo FROM usuarios WHERE id=?');$st->execute([$_SESSION['user_id']]);$u=$st->fetch();if(!$u||!(int)$u['activo']){$_SESSION=[];session_destroy();fail('La sesión ya no es válida.',401);}$categoria=(int)$u['categoria'];if($categoria<0||$categoria>11){$_SESSION=[];session_destroy();fail('La categoría de la cuenta no es válida.',401);}$_SESSION['categoria']=$categoria;return ['id'=>(int)$u['id'],'nombre'=>$u['nombre'],'categoria'=>$categoria,'rol'=>$categoria>=10?'admin':'usuario'];}
function requireAdmin():array{$u=currentUser();if(!in_array($u['categoria'],[10,11],true))fail('Se requiere una categoría 10 u 11.',403);return $u;}
function requiredText(array $d,string $key,int $max=160):string{$v=trim((string)($d[$key]??''));if($v===''||mb_strlen($v)>$max)fail("El campo $key es obligatorio (máximo $max caracteres).",422);return $v;}
set_exception_handler(function(Throwable $e):void{error_log((string)$e);fail('Error interno de la API. Revisá la configuración de MySQL y PHP.',500);});
