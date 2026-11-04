<?php
require_once __DIR__.'/../bootstrap.php';if($_SERVER['REQUEST_METHOD']!=='POST')fail('Método no permitido.',405);$_SESSION=[];if(ini_get('session.use_cookies')){$p=session_get_cookie_params();setcookie(session_name(),'',time()-42000,$p['path'],$p['domain']??'',false,true);}session_destroy();respond(['ok'=>true]);
