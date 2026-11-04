<?php
require_once __DIR__.'/../bootstrap.php';currentUser();respond(db()->query('SELECT id,nombre,apellido,documento,email,telefono,direccion FROM clientes ORDER BY apellido,nombre')->fetchAll());
