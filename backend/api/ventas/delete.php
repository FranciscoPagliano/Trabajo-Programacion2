<?php
require_once __DIR__.'/../bootstrap.php';
requireAdmin();
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') fail('Método no permitido.', 405);
$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id || $id < 1) fail('ID de venta inválido.', 422);
$pdo = db();
try {
    $pdo->beginTransaction();
    $st = $pdo->prepare('SELECT id,numero_factura FROM ventas WHERE id=? FOR UPDATE');
    $st->execute([$id]);
    $venta = $st->fetch();
    if (!$venta) throw new DomainException('No se encontró la factura.', 404);
    $st = $pdo->prepare('DELETE FROM venta_detalles WHERE venta_id=?');
    $st->execute([$id]);
    $st = $pdo->prepare('DELETE FROM ventas WHERE id=?');
    $st->execute([$id]);
    $pdo->commit();
    respond(['ok'=>true,'id'=>$id,'numero_factura'=>$venta['numero_factura']]);
} catch (DomainException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fail($e->getMessage(), $e->getCode() ?: 400);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $e;
}
