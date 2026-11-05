# Norte & Co. — gestión empresarial

Aplicación de ejemplo para presentar una gestión de clientes, sucursales y ventas. El frontend usa Angular; la API usa PHP y PDO; MySQL guarda los datos. No usa Docker.

## Estado de esta instalación

El proyecto usa Angular en `http://127.0.0.1:4200` y la API PHP servida por XAMPP en `http://localhost/empresa-api/api`. Iniciá Apache y MySQL desde XAMPP Control Panel si se detienen. Angular reenvía las llamadas `/api` a PHP mediante `proxy.conf.json`, por lo que la sesión conserva el mismo origen del frontend.

## Requisitos detectados

- Node.js y npm ya estaban instalados.
- XAMPP está instalado en `C:\xampp` (incluye Apache, PHP, MySQL y phpMyAdmin).
- Angular CLI se instala en las dependencias locales con `npm install`; se usa como `npx ng`.
- El ZIP adjunto contenía `graficos/index.html` y `style.css`: gráficos de columnas apiladas, barras agrupadas y líneas. Esos archivos originales usan datos aleatorios. Se tomó el diseño de los tres gráficos y se reemplazó el origen de datos por las series mensuales reales que devuelve la API.
- No había código, base de datos ni esquema previo en la carpeta de trabajo.

## Preparar MySQL y PHP (XAMPP)

1. Abrí `C:\xampp\xampp-control.exe` e iniciá **Apache** y **MySQL** si no están activos.
2. Si necesitás recrear la base, en phpMyAdmin (`http://localhost/phpmyadmin`) importá `database/schema.sql`. Crea `empresa_demo`, las cinco tablas y algunos clientes y sucursales de ejemplo. No crea ventas ficticias; por eso los gráficos arrancan en cero.
   Si la base ya existía con acentos mal codificados, ejecutá `database/repair_sample_utf8.sql` sobre `empresa_demo`; corrige los registros de ejemplo por email e ID.
3. La carpeta de API ya está en `C:\xampp\htdocs\empresa-api\api`. Si reinstalás XAMPP, copiá ahí `backend`; la configuración predeterminada usa `127.0.0.1`, base `empresa_demo`, usuario MySQL `root` y contraseña vacía, como en una instalación local estándar de XAMPP. Editá los valores en `backend/api/bootstrap.php` si tu instalación usa otras credenciales.
4. Para crear el administrador en una instalación nueva, ejecutá desde PowerShell:

   ```powershell
   cd C:\xampp\htdocs\empresa-api
   C:\xampp\php\php.exe seed_admin.php
   ```

   Acceso inicial ya creado: `admin@empresa.local` / `Admin123!` (categoría 10). Para elegir otra contraseña al crear la cuenta, definí `EMPRESA_ADMIN_PASSWORD` en esa consola.
   Para cambiar la clave inicial ya creada, definí `EMPRESA_ADMIN_PASSWORD` (mínimo 12 caracteres) y ejecutá `C:\xampp\php\php.exe change_admin_password.php`.
   En una base existente, importá `database/migrate_user_categories.sql` una vez para agregar `usuarios.categoria` y elevar a categoría 10 las cuentas antiguas con `rol='admin'`. Para crear las cuentas de prueba 0–11, definí `EMPRESA_TEST_PASSWORD` y ejecutá `C:\xampp\php\php.exe seed_test_users.php` desde `C:\xampp\htdocs\empresa-api`.
5. La API queda en `http://localhost/empresa-api/api`. Las sucursales se pueden consultar con sesión; Clientes y Ventas requieren sesión. Las escrituras requieren categoría 10 u 11. Durante el desarrollo Angular la consume por `/api` a través del proxy.

## Iniciar Angular

Desde la raíz de este proyecto:

```powershell
npm install
npm start
```

Abrí `http://127.0.0.1:4200` (también podés usar `http://localhost:4200`). Ejecutá `npm start` para iniciar Angular. El proxy `proxy.conf.json` envía `/api/...` a `http://localhost/empresa-api/api/...`; PHP permite CORS con credenciales para `http://127.0.0.1:4200` y `http://localhost:4200` si se consulta la API directamente. La sesión PHP usa una cookie HttpOnly.

## Probar la aplicación

- Home y Sucursales son públicas. Clientes y Ventas requieren iniciar sesión.
- Categorías 0–9 pueden consultar Clientes, Sucursales, Ventas y gráficos. Categorías 10–11 también pueden crear, editar y eliminar; Angular y PHP verifican la categoría. No hay registro público: las cuentas se crean por consola con contraseñas guardadas mediante `password_hash()`.
- El formulario de venta genera un comprobante interno `NC-...`, guarda cabecera y detalle dentro de una transacción, y el importe aparece de inmediato en el resumen y el mes de la sucursal correspondiente. El comprobante no es fiscal.
- El filtro de sucursal y año actualiza la tabla y los tres gráficos de la sección Sucursales.
- Clientes y Sucursales incluyen borrado con confirmación; la API devuelve `409` si existen ventas asociadas y `403` para roles que no son administrador.
- Las facturas existentes se editan como una línea de detalle (descripción/producto, cantidad y precio unitario); el servidor recalcula el total dentro de una transacción y conserva el número de factura. El borrado de factura también usa una transacción y elimina sus detalles.

## Modelo de datos

`usuarios` identifica quién cargó cada operación; `clientes` y `sucursales` se vinculan con `ventas` mediante claves foráneas. Cada venta tiene uno o más registros en `venta_detalles`. La suma de ventas por sucursal y mes se calcula desde las facturas guardadas, no desde contadores duplicados.

```text
usuarios 1 ─── N ventas N ─── 1 clientes
                       └──── N sucursales
ventas 1 ─── N venta_detalles
```

## Configuración de conexión

Copiá `backend/.env.example` como referencia. XAMPP no carga `.env` por defecto: configura las variables `EMPRESA_DB_HOST`, `EMPRESA_DB_NAME`, `EMPRESA_DB_USER` y `EMPRESA_DB_PASS` en Apache si necesitás otros valores. Alternativamente, ajustá los valores predeterminados en `backend/api/bootstrap.php`.

Para la explicación del segundo parcial, la comparación con los ejemplos del profesor, el listado exacto de archivos a entregar y el recorrido de prueba, consultá [`docs/SEGUNDO_PARCIAL.md`](docs/SEGUNDO_PARCIAL.md).
