# Guía breve para defender el sistema

## 1. ¿Qué problema resuelve?

El sistema organiza en un mismo lugar la información de clientes, sucursales y ventas. Permite consultar los registros, generar comprobantes internos y ver cómo evolucionan las ventas por mes y sucursal.

## 2. Tecnologías

- **Angular** organiza la aplicación en pantallas y permite navegar sin recargar todo el sitio.
- **TypeScript** contiene la lógica de los componentes y servicios de Angular.
- **HTML** define lo que se muestra en cada pantalla y **CSS** su presentación adaptable.
- **PHP** recibe las solicitudes, valida datos y permisos, y consulta o modifica MySQL.
- **MySQL** guarda los datos de forma relacionada.
- **XAMPP** permite ejecutar Apache para PHP y el servidor MySQL en la computadora local.

## 3. Arquitectura

```text
Navegador → Angular → servicios HTTP → API PHP → MySQL
```

Angular usa la ruta `/api` y, durante el desarrollo, `proxy.conf.json` la reenvía a la API de PHP en XAMPP. Angular no se conecta directamente a la base de datos.

## 4. ¿Qué hace cada parte?

- **Componentes Angular:** `HomeComponent` y `LoginComponent` están en `src/app/pages/pages.component.ts`. `ClientesComponent`, `SucursalesComponent` y `VentasComponent` tienen sus archivos propios en `src/app/pages/` y manejan las pantallas y formularios.
- **Servicios Angular:** `AuthService` administra login, usuario y cierre de sesión. `DataService` envía las solicitudes de clientes, sucursales, ventas y series mensuales.
- **Rutas y guards:** `src/app/app.routes.ts` define las rutas. `authGuard` requiere una sesión; `adminGuard` restringe las rutas de administración a categorías superiores; `guestGuard` evita que una persona con sesión vuelva al login.
- **PHP:** cada archivo de `backend/api/` atiende una operación concreta. Por ejemplo, `clientes/list.php` consulta los clientes y `ventas/create.php` registra una factura. `bootstrap.php` centraliza la conexión, la sesión y las respuestas JSON.
- **MySQL:** `database/schema.sql` define las tablas y sus relaciones.
- **XAMPP:** Apache sirve los archivos PHP y MySQL guarda y entrega los datos.

## 5. Login, sesión y categorías

1. Angular envía el email y la contraseña a `POST /api/auth/login.php`.
2. PHP busca el email activo en `usuarios` y compara la clave recibida con su hash mediante `password_verify()`.
3. Si coincide, PHP inicia una sesión, guarda el identificador y la categoría, y devuelve los datos del usuario.
4. Angular conserva el usuario en `AuthService` y muestra las opciones que corresponden a su categoría.

Las categorías **0 a 9** pueden consultar clientes, sucursales, ventas y gráficos. Las categorías **10 y 11** tienen los mismos permisos superiores: además pueden crear, editar y eliminar clientes, sucursales y ventas. No hay una diferencia definida entre 10 y 11.

Los guards protegen la navegación de Angular. PHP también comprueba la sesión en los endpoints de consulta. Para las operaciones de escritura, además, requiere categoría 10 u 11.

## 6. Clientes, sucursales y ventas

`DataService` usa solicitudes HTTP para pedir los datos a PHP. Los componentes reciben las respuestas y las muestran en tablas. Clientes se ordenan por apellido y nombre; sucursales muestran nombre, dirección y cantidad de empleados; ventas muestran factura, fecha, cliente, sucursal, detalle e importe.

En Sucursales, `series.php` calcula los totales por mes y sucursal para el año solicitado. `SucursalesComponent` actualiza los tres gráficos —**Columnas Apiladas**, **Ventas por Sucursal** y **Tendencia de Ventas**— con esos datos y permite filtrar por sucursal.

## 7. Facturas y gráficos

Desde Ventas, una categoría superior puede cargar fecha, cliente, sucursal, detalle e importe. PHP genera un número `NC-...` y guarda la operación en `ventas` y su detalle en `venta_detalles`. El comprobante que se muestra es interno y **no tiene validez fiscal**.

Al cambiar la venta, PHP actualiza las tablas. Los resúmenes mensuales y los gráficos consultan los importes registrados, por eso reflejan el estado actual de las ventas. La creación, edición y eliminación de ventas usan transacciones: si falla una parte, PHP revierte los cambios para no dejar datos incompletos.

## 8. Tablas y relaciones

- `usuarios`: cuentas, hash de contraseña y categoría.
- `clientes`: datos de cada cliente.
- `sucursales`: nombre, dirección y empleados.
- `ventas`: cabecera de la operación, número, fecha, cliente, sucursal, total y usuario que la cargó.
- `venta_detalles`: descripción, cantidad, precio y subtotal relacionados con una venta.

Una venta referencia un cliente, una sucursal y un usuario. Una venta puede tener detalles; en la carga actual se guarda una línea de detalle.

## 9. Palabras que pueden preguntar

- **Consulta preparada:** PHP separa la consulta SQL de los valores recibidos. Así evita tratar esos valores como parte de una instrucción SQL.
- **Sesión:** estado temporal que permite recordar que una persona ya inició sesión.
- **Cookie:** pequeño dato que el navegador envía para identificar esa sesión. En este proyecto la cookie es `HttpOnly`, por lo que el código JavaScript no puede leerla.
- **Transacción:** conjunto de cambios que se confirma completo o se revierte completo si algo falla.

## 10. Cerrar sesión y ejecutar

Al salir, Angular envía `POST /api/auth/logout.php`, PHP destruye la sesión y Angular limpia el usuario y vuelve a `/login`.

1. Iniciar **Apache** y **MySQL** desde XAMPP.
2. En la carpeta del proyecto, ejecutar `npm start`.
3. Abrir `http://127.0.0.1:4200`.

## 11. Archivos clave

- Rutas y guards: `src/app/app.routes.ts`, `src/app/core/guards.ts`.
- Login y autenticación: `src/app/core/auth.service.ts`, `backend/api/auth/login.php`, `backend/api/auth/me.php`, `backend/api/auth/logout.php`.
- Servicios de datos: `src/app/core/data.service.ts`.
- Pantallas: `src/app/pages/pages.component.ts`, `src/app/pages/clientes.component.ts`, `src/app/pages/sucursales.component.ts`, `src/app/pages/ventas.component.ts` y sus archivos HTML.
- API: `backend/api/clientes/`, `backend/api/sucursales/`, `backend/api/ventas/`.
- Base de datos: `database/schema.sql`.

## 12. Preguntas posibles del profesor

**¿Por qué Angular no se conecta directamente a MySQL?**  
Porque el navegador consulta a PHP; PHP valida la solicitud y accede a MySQL.

**¿Cómo se comprueba la contraseña?**  
PHP usa `password_verify()` contra el hash guardado en `usuarios`.

**¿Qué cambia según la categoría?**  
De 0 a 9 solo se consulta. Las categorías 10 y 11 también administran clientes, sucursales y ventas.

**¿Qué pasa si falla el guardado de una venta?**  
La transacción se revierte para evitar que quede guardada solo una parte.

**¿La factura sirve para fines fiscales?**  
No. Es un comprobante interno de ejemplo.

**¿De dónde salen los gráficos?**  
De la consulta `sucursales/series.php`, que agrupa los totales reales de MySQL por sucursal y mes.

**¿Qué hace XAMPP?**  
Ejecuta Apache y MySQL localmente; Angular se inicia aparte con `npm start`.

**¿La API protege las consultas de sucursales?**  
Sí. Los endpoints `sucursales/list.php` y `sucursales/series.php` verifican la sesión y permiten la consulta a cualquier categoría autenticada.

## Para memorizar

> “Angular muestra la aplicación y consulta a PHP mediante servicios HTTP. PHP valida la sesión, los permisos y los datos, y consulta MySQL. Las categorías 0 a 9 solo consultan; las 10 y 11 también administran. Las facturas se guardan con sus detalles en una transacción y los gráficos se calculan con las ventas de la base. XAMPP ejecuta Apache y MySQL; Angular se inicia con `npm start` en el puerto 4200.”
