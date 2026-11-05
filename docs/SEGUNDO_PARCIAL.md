# Presentación y entrega — segundo parcial

## Recorrido breve para exponer

1. **Angular consulta a PHP.** Los componentes usan `DataService` y `AuthService`, que hacen peticiones HTTP JSON a la API. El interceptor envía la cookie de sesión. Angular nunca abre una conexión a MySQL.
2. **PHP consulta MySQL.** `backend/api/bootstrap.php` configura PDO con `utf8mb4`. Los endpoints consultan las tablas reales con SQL preparado; clientes y ventas exigen sesión, y sucursales/series leen sus filas desde MySQL.
3. **Login.** El formulario de `LoginComponent` envía email y contraseña a `auth/login.php`. PHP busca el email activo en `usuarios`, valida el hash con `password_verify()`, renueva la sesión, guarda `user_id` y `categoria`, y devuelve usuario y categoría. `auth/me.php` comprueba la sesión al iniciar Angular; `auth/logout.php` la destruye.
4. **Categoría.** `usuarios.categoria` es numérica de 0 a 11. Categorías 0–9 son de consulta y 10–11 tienen permisos superiores iguales. La categoría se obtiene de MySQL al validar cada sesión; nunca se confía en un rol enviado por el navegador.
5. **Menú y permisos.** Toda cuenta autenticada ve Clientes, Sucursales y Ventas; categorías 10–11 agregan accesos directos de alta. `authGuard` valida el rango 0–11 y `adminGuard` protege las rutas de alta. Los formularios comprueban categoría y PHP vuelve a exigir 10 u 11 en cada operación de escritura.
6. **Consultas reales.** `clientes/list.php`, `sucursales/list.php`, `ventas/list.php` y `sucursales/series.php` leen la base. Los gráficos usan las series calculadas desde las ventas guardadas. El frontend solo conserva etiquetas de meses y texto de interfaz, no registros inventados.

## Cuentas de práctica

Se crearon `prueba.cat00@empresa.local` hasta `prueba.cat11@empresa.local`, una cuenta por categoría (el número de dos dígitos del correo es la categoría). Para todas se usó la contraseña de práctica `PruebaCat2026!`; MySQL almacena solamente `password_hash()`. Las categorías 10 y 11 tienen los mismos permisos.

Para recrearlas, definí `EMPRESA_TEST_PASSWORD` (mínimo 12 caracteres) antes de ejecutar `backend/seed_test_users.php`. El sembrador actualiza únicamente estas 12 direcciones de demostración y no borra otros usuarios.

## Ejemplos del profesor comparados

- `AngPHP.rar`: su `src/app/articulos.service.ts` usa `HttpClient` para consultar `Get_Clientes.php`, `Get_Sucus.php` y `Get_Ventas.php`; se tomó como referencia conceptual para el patrón servicio Angular → endpoints PHP. El archivo no incluye login ni roles y contiene una URL de hosting externa, así que no se copió.
- `Consultas sin pantalla.rar`: `Get_Clientes.php`, `Get_Sucus.php` y `Get_Ventas.php` devuelven filas consultadas por PHP; `conexion2.php` centraliza la conexión. Se usó para contrastar la responsabilidad de los endpoints. La aplicación conserva su esquema actual (`clientes`, `sucursales`, `ventas`) y sus consultas preparadas PDO, en vez de copiar las tablas/credenciales del ejemplo.
- Ningún archivo de los RAR contiene el login/categorías solicitados. El login del proyecto es implementación propia vinculada a `usuarios` y `password_hash`.

## Archivos a entregar

Entregá estos archivos/carpetas del proyecto (no los RAR ni `node_modules`):

- `src/app/core/auth.service.ts`, `src/app/core/data.service.ts`, `src/app/core/guards.ts`, `src/app/core/models.ts`.
- `src/app/app.component.ts`, `src/app/app.routes.ts`, `src/app/pages/pages.component.ts`.
- `src/app/pages/clientes.component.ts` y `clientes.component.html`.
- `src/app/pages/sucursales.component.ts` y `sucursales.component.html`.
- `src/app/pages/ventas.component.ts` y `ventas.component.html`.
- La API completa: `backend/api/bootstrap.php`, `backend/api/auth/{login,me,logout}.php`, `backend/api/clientes/{list,create,delete}.php`, `backend/api/sucursales/{list,series,create,delete}.php` y `backend/api/ventas/{list,create,update,delete}.php`.
- `database/schema.sql`, `database/migrate_user_categories.sql` y `backend/seed_admin.php` para crear o adaptar tablas y preparar el administrador inicial.
- `database/migrate_user_categories.sql` y `backend/seed_test_users.php` para adaptar la base existente y crear cuentas de prueba con contraseñas hasheadas.

Subí también `src/styles.css` si te piden entregar la interfaz completa, y `docs/SEGUNDO_PARCIAL.md` como guía de exposición. No entregues contraseñas de MySQL; creá/ajustá el administrador con el script local y compartí credenciales solo si el docente las solicita de forma segura.

## Cómo probar en clase

1. Iniciá Apache y MySQL desde XAMPP, importá `database/schema.sql` en phpMyAdmin y copiá `backend` a `C:\xampp\htdocs\empresa-api`.
2. Si todavía no existe el administrador, ejecutá `C:\xampp\php\php.exe C:\xampp\htdocs\empresa-api\seed_admin.php` desde PowerShell. El usuario inicial documentado en `README.md` solo aplica a una base nueva.
3. En la raíz del frontend ejecutá `npm install` (solo la primera vez) y `npm start`; abrí `http://127.0.0.1:4200`.
4. Iniciá sesión. Verificá Clientes, Sucursales y Ventas; los listados y las series deben coincidir con las filas de `empresa_demo`. Un rol `usuario` no debe ver controles de escritura; al administrador sí.
5. Creá un cliente o sucursal de prueba, registrá una venta y verificá la lista, el resumen y los gráficos. Eliminá los datos de prueba desde la aplicación cuando termines.

La aplicación usa un comprobante interno, no fiscal. Los ejemplos del profesor son material de consulta; su código legacy y su conexión externa no se usan en ejecución.
