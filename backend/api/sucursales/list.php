<?php
require_once __DIR__.'/../bootstrap.php';currentUser();$rows=db()->query('SELECT id,nombre,direccion,empleados FROM sucursales WHERE activa=1 ORDER BY nombre')->fetchAll();foreach($rows as &$r){$r['id']=(int)$r['id'];$r['empleados']=(int)$r['empleados'];}respond($rows);
