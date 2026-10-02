# Auditoría del Centro de Operaciones — 1 octubre 2026

El centro puede evolucionar a una OTA con un superpanel y un panel por hotel. Esta entrega prepara el código y las correcciones de permisos; todavía no está publicada ni aplicada a la base de datos de producción.

## Datos confirmados

- Repositorio: `diegoromarioH/centro-operaciones`, rama base `main`, commit `2df2b47c43c2c8882ff04620fe85a2a478e26926`.
- Supabase: proyecto `reservaometepe`, `nnhhdxknriatpzzvuglq`, activo.
- Conteo SQL real: 3 alojamientos, 3 habitaciones, 0 responsables en `hosts`, 0 vínculos en `accommodation_hosts`, 17 perfiles.
- Perfiles: 3 cuentas `admin` y 14 cuentas `host`; no hay una cuenta `super_admin` asignada. El registro de usuarios asigna `host` por defecto, así que esos 14 perfiles no prueban que existan 14 propietarios de hoteles.
- Las tablas públicas consultadas tienen RLS habilitado. Habilitar RLS por sí solo no garantiza que sus políticas sean correctas.
- El inventario de `list_tables` devolvía estimaciones de cero para alojamientos y habitaciones. Se sustituyeron por consultas SQL directas.
- Los 3 alojamientos son Playa Santo Domingo Inn, Congos Lodge y Volcán View Eco Lodge. Su existencia en la base no certifica tarifas, disponibilidad ni convenios comerciales.

## Hallazgos y cambios preparados

| Área | Problema encontrado | Resultado preparado |
| --- | --- | --- |
| Acceso al superpanel | Cualquier sesión autenticada montaba todas las rutas y el menú administrativo | Verificación de identidad y perfil activo; acceso administrativo para `admin` y `super_admin`; panel separado para `host` |
| Perfiles de hoteles | No había una vista conjunta de fichas, habitaciones y responsables | Nueva ruta `/alojamiento/hotel-profiles`, búsqueda, acceso directo a ficha y asignación de dueño |
| Panel del dueño | El centro no ofrecía un espacio propio para los alojamientos asignados | Ruta `/mi-hotel`, selector de hoteles propios, edición de ficha y habitaciones, consulta de solicitudes y reservas |
| Publicación y ranking | Un dueño podía actualizar cualquier columna de su alojamiento mediante la API | Lista de campos editables y control en PostgreSQL para publicación, slug, ranking y campos internos |
| Cuentas inactivas | La función de pertenencia al hotel no comprobaba estado activo o rol del perfil y responsable | Validación de perfil `host` activo y responsable activo, también en consultas operativas |
| Solicitudes y reservas | Un slug podía coincidir con otro hotel aunque el UUID indicara un destino diferente | Prioridad al UUID; slug solo para registros heredados sin UUID |
| Archivos | Políticas generales permitían a cualquier autenticado modificar archivos ajenos y consultar documentos privados | Escrituras del dueño limitadas a su carpeta y buckets de hotel; documentos privados limitados a administrador o propietario del archivo |
| Calendarios | Se validaba `owner_id`, pero no que el destino perteneciera al usuario | Validación de hotel/habitación/experiencia y correspondencia de la conexión |
| Solicitudes de alta | El dueño podía insertar estados aprobados o editar datos de revisión | El dueño puede enviar borradores; aprobación y revisión quedan a cargo del administrador |
| Crear habitaciones | Un registro prellenado se trataba como existente y enviaba nulos contra columnas con valores por defecto; slug obligatorio no marcado | Se distingue por `record.id`, se conservan valores por defecto y se exige slug |
| Tablas de solo lectura | Mostraban edición, borrado y guardado | Detalle de consulta y exportación; sin botones de mutación |
| Errores de consulta | Algunas pantallas mostraban vacío o cero después de un error | Errores visibles y reintento en perfiles, alojamientos, habitaciones, accesos y resumen |
| Crear accesos | Podía dejar cuentas huérfanas tras un fallo y usaba `Math.random` para contraseñas | Validación previa del hotel, aleatoriedad criptográfica, limpieza de registros nuevos si falla y vinculación de cuentas `host` existentes |
| Mi cuenta | El dueño no podía reemplazar su contraseña temporal desde el centro | Página de cambio de contraseña con confirmación y opción de mostrarla |
| Navegación | Existía `RoomsPage`, pero faltaba su ruta y registro en el menú | Ruta de habitaciones y navegación SPA para alojamiento estático |

## Verificación realizada

- Configuración de 37 tablas cotejada con las columnas reales de Supabase: todas las columnas configuradas existen.
- Pruebas automatizadas de acceso por rol y filtrado de campos administrativos: aprobadas.
- Análisis de sintaxis de JavaScript/JSX y TypeScript de la función preparada: aprobado.
- Compilación completa del frontend con esbuild y las fuentes de las dependencias exactas recuperadas del repositorio: aprobada. No se sustituyeron las versiones del frontend para esta comprobación.
- Parche SQL y pruebas de aislamiento ejecutados en una transacción con `ROLLBACK`: edición del propio hotel, bloqueo de otro hotel, campos administrativos, habitaciones, solicitudes, reservas, calendario, estados de aprobación, usuarios/responsables inactivos, acceso administrativo y lectura anónima del catálogo.
- Predicados de Storage comprobados con carpetas y propietarios propios/ajenos. Esto verifica las reglas SQL; no sustituye una carga real por la API de Storage.
- Confirmado después de las pruebas: no quedaron hoteles de prueba ni la función nueva de propiedad de destinos aplicada a producción.

## Límites y tareas pendientes antes de publicar

1. Revisar y desplegar el frontend, el parche `database/ota_access.sql` y la función `create-host-account` como una misma entrega. El parche requiere ejecutarse una sola vez; las pruebas SQL deben envolverse en una transacción y revertirse.
2. Ejecutar `npm ci` y `npm run build` en CI con acceso al registro npm. Aquí la descarga de paquetes fue bloqueada por la red; la comprobación alternativa con esbuild sí completó el frontend.
3. Probar en navegador con una cuenta administrativa y dos dueños: entrar, cerrar sesión, guardar ficha, crear habitación, subir y reemplazar foto, cambiar contraseña y abrir rutas directamente desde móvil. Playwright no pudo iniciar porque Chromium no está instalado. No se certifica la experiencia visual ni el flujo de autenticación real.
4. Probar la Edge Function preparada con un administrador y con un dueño, incluyendo hotel inexistente, correo existente y fallo de vinculación. No se creó ninguna cuenta real ni se modificaron credenciales durante la auditoría.
5. Asignar responsables a los hoteles existentes. No se dedujo ni inventó la relación entre los 14 usuarios y los 3 alojamientos.
6. Confirmar qué cuenta será la de Diego como `super_admin` si se desea ese rol explícito. No se elevaron permisos de ningún usuario; los administradores actuales conservan su acceso.
7. Activar la protección de contraseñas filtradas si el plan/configuración de Auth lo permite: [guía oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). El asesor de seguridad la reportó desactivada. No se modificó esa configuración.

## Alcance de OTA

Esta base permite gestión de fichas, habitaciones, responsables y actividad por hotel. No equivale todavía a una OTA con reservas instantáneas, cobros automáticos o inventario de habitaciones sincronizado.

- La lectura de solicitudes/reservas del panel del hotel muestra hasta 100 registros recientes por sección; la operación comercial sigue en el superpanel.
- Tener tablas de calendarios y comisiones no demuestra que exista sincronización iCal, cobro, liquidación o cálculo automático funcionando.
- No se probaron campañas de correo, notificaciones, pagos, devoluciones o integraciones externas, porque serían operaciones reales. No se enviaron mensajes ni correos.
- El centro conserva la edición histórica de políticas en dos lugares (`accommodations` y `accommodation_policies`); antes de operar hoteles reales conviene definir una única fuente para evitar discrepancias entre la ficha y la landing.
- Los asesores de rendimiento reportaron 22 claves foráneas sin índice de cobertura, políticas duplicadas y otras recomendaciones. Se añadió el índice de búsqueda por responsable necesario para los perfiles; no se eliminaron índices ni políticas históricas de otros módulos.
- Las funciones públicas de control de acceso se prepararon como envoltorios `SECURITY INVOKER` con consultas privadas. La advertencia original está documentada en [el asesor de funciones](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- El repositorio ya incluía `node_modules`, `dist` y `.env` versionados. Se preparó `.gitignore`; limpiar el historial o desversionar esos directorios es una tarea aparte. No se expuso ninguna clave de servicio.

## Pasos de uso después del despliegue

1. Abrir **Superpanel → Perfiles de hoteles**.
2. Revisar la ficha existente o crear un alojamiento en **Gestionar alojamientos**.
3. Usar **Dar acceso** para crear o vincular la cuenta del dueño a ese hotel.
4. El dueño entra al centro con su cuenta y accede automáticamente a **Mi hotel**.
5. Un mismo dueño puede tener varios hoteles asignados. El superpanel mantiene la publicación y el control administrativo.


## Segunda entrega — navieras, reservas y cobros manuales

Cambios preparados en la misma propuesta, todavía sin desplegar:

- Horarios ordenados por nombre de naviera, nombre de ruta y salida, con filtros independientes. El formulario incorpora `operator_id`. No se inventan relaciones de los horarios históricos: quedan «Sin asignar» hasta vincularlos.
- Terminología de interfaz: anfitrión y alojamiento. Se mantienen rutas y nombres técnicos anteriores para conservar enlaces.
- Registro de reservas de alojamiento con huésped, fechas, importe, pago del huésped y porcentaje de comisión por reserva. El formulario de esta entrega está enfocado a alojamientos. No se establece un porcentaje comercial universal.
- Acción desde la solicitud que abre la reserva existente o prepara un registro vinculado. El registro se guarda cuando el operador completa el formulario; abrir WhatsApp no crea una reserva automáticamente.
- Reserva sin borrado físico. SQL preparado para calcular la comisión, validar los datos y evitar dos reservas nuevas para una solicitud mediante bloqueo del registro de solicitud.
- Nueva pantalla `/finanzas/collections`: cuentas por cobrar vinculadas a reservas completadas, vencimiento, abonos manuales con referencia y método, saldo parcial/pagado/vencido, anulación con motivo, historial y exportación CSV por alojamiento. Los totales se calculan por moneda, sin conversiones.
- El cobro se emite explícitamente por el administrador al completar la estancia. El saldo se calcula por abonos confirmados, no por el pago del huésped. La consulta financiera recupera páginas completas para evitar presentar los primeros 1.000 registros como un total global.
- `database/ota_finance.sql` añade tablas con RLS administrativa, importes calculados desde la reserva, bloqueo de cobros duplicados y abonos superiores al saldo, principal inmutable y autor/fecha de creación y anulación. Las reservas facturadas quedan congeladas salvo el estado de pago del huésped. La corrección/reemisión de un cobro anulado y las notas de crédito requieren un flujo posterior; no se permite una edición silenciosa de su base.

Verificación de esta segunda entrega:

- 4 pruebas Node aprobadas: acceso, campos administrativos, abonos/reversiones y separación de monedas.
- `tests/ota_finance.sql` preparado, pero NO ejecutado: la revisión automática rechazó la transacción de prueba sobre producción, aun con `ROLLBACK`, por alcance de permisos y riesgo de bloqueos. No se modificó Supabase.
- `npm ci` bloqueado por HTTP 403 del registro npm; `npm run build` no pudo iniciar por falta de Vite. La compilación aprobada en la primera auditoría no valida estas nuevas pantallas.
- No se realizaron pruebas de navegador ni se certificó el flujo completo de nuevas reservas y cobros.

Despliegue: aplicar primero `ota_access.sql`, luego `ota_finance.sql` en transacción, ejecutar pruebas en un entorno aislado y compilar/probar el frontend antes de publicar. Asignar las navieras a horarios históricos y confirmar el porcentaje comercial y la política de cancelación con cada anfitrión. No aplicar una comisión retrospectiva sin revisar el acuerdo.

No se conecta una pasarela ni se envían mensajes. Para registrar también reservas creadas fuera de este centro (landing, panel del anfitrión, llamadas o WhatsApp), hace falta integrar esos puntos de entrada con el mismo registro. Esta propuesta habilita el flujo manual del superpanel; no afirma que los otros canales ya lo cumplan. El panel del anfitrión continúa consultando las reservas y no tiene acceso al libro interno de cobros. Comprobantes adjuntos, conciliación bancaria, comisiones de cancelación, suscripciones y PDF de facturación quedan pendientes.

## Ficha y alta de alojamientos (2 octubre 2026)
- Navegación por operación, landing, movilidad, finanzas, marketing, estadísticas y configuración. Habitaciones, políticas, beneficios, anfitrión, actividad y cobros se consultan desde una ficha.
- La OTA puede crear una ficha oculta y asignar un anfitrión posteriormente; también puede generar credenciales sin alojamiento previo. Compartir credenciales sigue siendo manual.
- El anfitrión guarda borradores o los envía a revisión. La OTA pide cambios, rechaza con motivo o aprueba. Aprobar crea ficha oculta y vínculo en una transacción; publicar se controla desde la ficha tras completar habitaciones.
- `database/ota_onboarding.sql` debe aplicarse después de `ota_access.sql`. Las escrituras de solicitudes pasan por RPC con comprobación de rol y propietario, bloqueo de fila y lista permitida de campos. Funciones con privilegios se alojan en `private`; las públicas son invocadoras.
- Archivar oculta la ficha conservando el historial. No es un bloqueo comercial de nuevas reservas: la validación de disponibilidad sigue pendiente.
- No se implementa motor de disponibilidad por fecha ni sincronización de canales; tampoco envío automático de invitaciones, ni garantía de reserva instantánea. Se mantiene confirmación manual y registro en la plataforma.
- Las pruebas SQL de onboarding usan PostgreSQL 17 aislado y un esquema reducido; no sustituyen validación integral de migraciones anteriores contra una copia del esquema productivo.
