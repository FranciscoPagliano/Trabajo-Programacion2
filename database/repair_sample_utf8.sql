USE empresa_demo;

-- Corrige los registros de muestra en instalaciones donde PowerShell
-- convirtio los acentos al importar un archivo SQL por stdin.
UPDATE clientes SET nombre=CONVERT(UNHEX('4D6172C3AD61') USING utf8mb4),apellido=CONVERT(UNHEX('47C3B36D657A') USING utf8mb4)
 WHERE email='maria.gomez@example.com';
UPDATE clientes SET nombre='Juan',apellido=CONVERT(UNHEX('50C3A972657A') USING utf8mb4)
 WHERE email='juan.perez@example.com';
UPDATE sucursales SET direccion=CONVERT(UNHEX('53616E204D617274C3AD6E20313234302C2053616E7461204665') USING utf8mb4)
 WHERE id=1 AND nombre='Centro';
UPDATE sucursales SET nombre=CONVERT(UNHEX('506172616EC3A1') USING utf8mb4),direccion=CONVERT(UNHEX('55727175697A61203536302C20506172616EC3A1') USING utf8mb4)
 WHERE id=2;
UPDATE sucursales SET direccion=CONVERT(UNHEX('43C3B372646F626120323135302C20526F736172696F') USING utf8mb4)
 WHERE id=3 AND nombre='Rosario';
