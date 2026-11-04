<?php
require_once __DIR__.'/../bootstrap.php';
requireAdmin();
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') fail('Método no permitido.', 405);
$id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id || $id < 1) fail('ID de sucursal inválido.', 422);
$pdo = db();
try {
    $pdo->beginTransaction();
    $st = $pdo->prepare('SELECT id FROM sucursales WHERE id=? FOR UPDATE');
    $st->execute([$id]);
    if (!$st->fetch()) throw new DomainException('No se encontró la sucursal.', 404);
    $st = $pdo->prepare('SELECT id FROM ventas WHERE sucursal_id=? LIMIT 1');
    $st->execute([$id]);
    if ($st->fetch()) throw new DomainException('No se puede eliminar la sucursal porque tiene ventas asociadas.', 409);
    $st = $pdo->prepare('DELETE FROM sucursales WHERE id=?');
    $st->execute([$id]);
    $pdo->commit();
    respond(['ok'=>true,'id'=>$id]);
} catch (DomainException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fail($e->getMessage(), $e->getCode() ?: 400);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $e;
}
