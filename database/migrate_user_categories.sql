USE empresa_demo;

-- Agrega la categoría numérica sin borrar usuarios ni modificar sus hashes.
SET @has_categoria = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'usuarios'
    AND COLUMN_NAME = 'categoria'
);
SET @add_categoria = IF(
  @has_categoria = 0,
  'ALTER TABLE usuarios ADD COLUMN categoria TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER rol',
  'SELECT 1'
);
PREPARE stmt_add_categoria FROM @add_categoria;
EXECUTE stmt_add_categoria;
DEALLOCATE PREPARE stmt_add_categoria;

SET @has_categoria_check = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'usuarios'
    AND CONSTRAINT_NAME = 'chk_usuarios_categoria'
);
SET @add_categoria_check = IF(
  @has_categoria_check = 0,
  'ALTER TABLE usuarios ADD CONSTRAINT chk_usuarios_categoria CHECK (categoria BETWEEN 0 AND 11)',
  'SELECT 1'
);
PREPARE stmt_add_categoria_check FROM @add_categoria_check;
EXECUTE stmt_add_categoria_check;
DEALLOCATE PREPARE stmt_add_categoria_check;

-- Conserva el permiso de los administradores existentes; los demás comienzan en 0.
UPDATE usuarios
SET categoria = 10
WHERE rol = 'admin' AND categoria = 0;
