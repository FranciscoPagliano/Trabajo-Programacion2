<?php
require_once __DIR__.'/../bootstrap.php';
requireAdmin();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Método no permitido.', 405);
$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id || $id < 1) fail('ID de venta inválido.', 422);
$d = jsonBody();
$cliente = filter_var($d['cliente_id'] ?? null, FILTER_VALIDATE_INT);
$sucursal = filter_var($d['sucursal_id'] ?? null, FILTER_VALIDATE_INT);
$fecha = (string)($d['fecha'] ?? '');
$detalle = requiredText($d, 'detalle', 500);
$cantidad = filter_var($d['cantidad'] ?? null, FILTER_VALIDATE_FLOAT);
$precio = filter_var($d['precio_unitario'] ?? null, FILTER_VALIDATE_FLOAT);
if (!$cliente || !$sucursal) fail('Seleccioná un cliente y una sucursal.', 422);
$date = DateTime::createFromFormat('!Y-m-d', $fecha);
if (!$date || $date->format('Y-m-d') !== $fecha) fail('La fecha debe tener formato YYYY-MM-DD.', 422);
if ($cantidad === false || $cantidad <= 0 || $cantidad > 100000) fail('La cantidad debe ser mayor que cero.', 422);
if ($precio === false || $precio <= 0 || $precio > 999999999) fail('El precio unitario debe ser mayor que cero.', 422);
$subtotal = round($cantidad * $precio, 2);
if ($subtotal <= 0 || $subtotal > 99999999999.99) fail('El total calculado está fuera del rango permitido.', 422);

$pdo = db();
try {
    $pdo->beginTransaction();
    $st = $pdo->prepare('SELECT id,numero_factura FROM ventas WHERE id=? FOR UPDATE');
    $st->execute([$id]);
    $venta = $st->fetch();
    if (!$venta) throw new DomainException('No se encontró la factura.', 404);
    $st = $pdo->prepare('SELECT id FROM clientes WHERE id=?');
    $st->execute([$cliente]);
    if (!$st->fetch()) throw new DomainException('El cliente seleccionado no existe.', 422);
    $st = $pdo->prepare('SELECT id FROM sucursales WHERE id=? AND activa=1');
    $st->execute([$sucursal]);
    if (!$st->fetch()) throw new DomainException('La sucursal seleccionada no existe.', 422);

    $st = $pdo->prepare('UPDATE ventas SET fecha=?,cliente_id=?,sucursal_id=?,total=? WHERE id=?');
    $st->execute([$fecha,$cliente,$sucursal,$subtotal,$id]);
    $st = $pdo->prepare('DELETE FROM venta_detalles WHERE venta_id=?');
    $st->execute([$id]);
    $st = $pdo->prepare('INSERT INTO venta_detalles(venta_id,descripcion,cantidad,precio_unitario,subtotal) VALUES(?,?,?,?,?)');
    $st->execute([$id,$detalle,$cantidad,$precio,$subtotal]);
    $pdo->commit();
    respond(['ok'=>true,'id'=>$id,'numero_factura'=>$venta['numero_factura'],'total'=>$subtotal]);
} catch (DomainException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fail($e->getMessage(), $e->getCode() ?: 400);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $e;
}
