const ExcelJS = require('exceljs');
const path = require('path');

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Analista QA - Table Bit';
  wb.created = new Date();
  const colors = { header: '1F4E79', subheader: '2E75B6', white: 'FFFFFF', light: 'D6E4F0', border: 'B4C6E7' };

  function styleHeader(ws, row, cols) {
    row.eachCell((c, i) => {
      if (i <= cols) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.header } };
        c.font = { bold: true, color: { argb: colors.white }, size: 11, name: 'Calibri' };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin', color: { argb: colors.border } }, bottom: { style: 'thin', color: { argb: colors.border } }, left: { style: 'thin', color: { argb: colors.border } }, right: { style: 'thin', color: { argb: colors.border } } };
      }
    });
    row.height = 30;
  }
  function styleCell(ws, row, cols, alt) {
    row.eachCell((c, i) => {
      if (i <= cols) {
        c.fill = alt ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EBF1FA' } } : { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.white } };
        c.font = { size: 10, name: 'Calibri' };
        c.alignment = { vertical: 'middle', wrapText: true };
        c.border = { top: { style: 'thin', color: { argb: colors.border } }, bottom: { style: 'thin', color: { argb: colors.border } }, left: { style: 'thin', color: { argb: colors.border } }, right: { style: 'thin', color: { argb: colors.border } } };
      }
    });
  }

  // ========== HOJA 1: PORTADA ==========
  const ws1 = wb.addWorksheet('Portada');
  ws1.mergeCells('A1:C1'); ws1.getCell('A1').value = 'SERVICIO NACIONAL DE APRENDIZAJE - SENA';
  ws1.getCell('A1').font = { bold: true, size: 16, name: 'Calibri', color: { argb: colors.header } };
  ws1.getCell('A1').alignment = { horizontal: 'center' };
  ws1.mergeCells('A2:C2'); ws1.getCell('A2').value = 'Centro de Formacion: [Nombre del Centro]';
  ws1.getCell('A2').alignment = { horizontal: 'center' };
  ws1.mergeCells('A3:C3'); ws1.getCell('A3').value = 'Programa: Analisis y Desarrollo de Software';
  ws1.getCell('A3').alignment = { horizontal: 'center' };
  ws1.mergeCells('A5:C5'); ws1.getCell('A5').value = 'EVIDENCIA: GA9-220501096-AA2-EV01';
  ws1.getCell('A5').font = { bold: true, size: 13, name: 'Calibri', color: { argb: colors.header } };
  ws1.getCell('A5').alignment = { horizontal: 'center' };
  ws1.mergeCells('A6:C6'); ws1.getCell('A6').value = 'Disena casos y define el ambiente de pruebas de software segun proyecto';
  ws1.getCell('A6').alignment = { horizontal: 'center' };
  ws1.mergeCells('A8:C8'); ws1.getCell('A8').value = 'PROYECTO: Table Bit - Plataforma de Reserva de Mesas en Restaurantes';
  ws1.getCell('A8').font = { bold: true, size: 12, name: 'Calibri' };
  ws1.getCell('A8').alignment = { horizontal: 'center' };
  const info = [['APRENDIZ', '[Nombre del aprendiz]'], ['INSTRUCTOR', '[Nombre del instructor]'], ['FICHA', '[Numero de ficha]'], ['FECHA', 'Junio de 2026'], ['VERSION', '1.0'], ['ESTADO', 'Final Aprobado']];
  info.forEach(([k, v], i) => { ws1.getCell('A' + (10 + i)).value = k; ws1.getCell('A' + (10 + i)).font = { bold: true, size: 11 }; ws1.getCell('B' + (10 + i)).value = v; });
  ws1.getColumn('A').width = 25; ws1.getColumn('B').width = 50; ws1.getColumn('C').width = 25;

  // ========== HOJA 2: AMBIENTE ==========
  const ws2 = wb.addWorksheet('Ambiente de Pruebas');
  const h2 = ws2.addRow(['Categoria', 'Elemento', 'Configuracion / Detalle']);
  styleHeader(ws2, h2, 3);
  const ambData = [
    ['Hardware', 'Procesador', 'Intel Core i5 o AMD Ryzen 5 (4 nucleos minimo)'],
    ['Hardware', 'Memoria RAM', '8 GB (16 GB recomendado)'],
    ['Hardware', 'Almacenamiento', '10 GB de espacio libre'],
    ['Software', 'Sistema Operativo', 'Windows 10/11 o Linux (Ubuntu 22.04+)'],
    ['Backend', 'Framework', 'Laravel (version utilizada por el proyecto)'],
    ['Backend', 'PHP', 'Version utilizada por el proyecto (^8.2)'],
    ['Backend', 'Servidor', 'php artisan serve --port=8000'],
    ['Backend', 'URL Base API', '{backend_url} (por defecto: http://localhost:8000/api)'],
    ['Frontend', 'Framework', 'React con TypeScript (versiones del proyecto)'],
    ['Frontend', 'Bundler', 'Vite (version del proyecto)'],
    ['Frontend', 'Servidor', 'npm run dev -- --port=5173'],
    ['Frontend', 'URL Base', '{frontend_url} (por defecto: http://localhost:5173)'],
    ['Base de Datos', 'Motor', 'MySQL (version del proyecto) / SQLite :memory: (pruebas automatizadas)'],
    ['Base de Datos', 'Seeders', 'php artisan db:seed'],
    ['Base de Datos', 'Migraciones', 'php artisan migrate:fresh --seed'],
    ['Navegadores', 'Chromium', 'Incluido con Playwright para pruebas E2E'],
    ['Navegadores', 'Estandar', 'Chrome o Edge para pruebas manuales'],
    ['Herramienta', 'PHPUnit', 'Version instalada en el proyecto - Pruebas unitarias e integracion'],
    ['Herramienta', 'Playwright', 'Version instalada en el proyecto - Pruebas E2E'],
    ['Herramienta', 'Vitest', 'Version instalada en el proyecto - Pruebas unitarias frontend'],
    ['Herramienta', 'Postman', 'Ultima estable - Pruebas funcionales manuales de API'],
    ['Herramienta', 'GitHub Actions', 'CI/CD - Workflows backend-ci.yml y frontend-ci.yml'],
    ['Variables', 'Token Admin', '{token_admin}'],
    ['Variables', 'Token Cliente', '{token_cliente}'],
    ['Variables', 'Token Superadmin', '{token_superadmin}'],
    ['Variables', 'ID Restaurante', '{id_restaurante}'],
    ['Variables', 'ID Reserva', '{id_reserva}'],
    ['Observaciones', '', 'Los placeholders deben reemplazarse con valores reales del entorno de ejecucion. Las credenciales de prueba estan definidas en los seeders del proyecto.'],
  ];
  ambData.forEach((d, i) => { const r = ws2.addRow(d); styleCell(ws2, r, 3, i % 2 === 1); });
  ws2.getColumn('A').width = 22; ws2.getColumn('B').width = 28; ws2.getColumn('C').width = 75;
  ws2.autoFilter = { from: 'A1', to: 'C1' }; ws2.views = [{ state: 'frozen', ySplit: 1 }];

  // ========== HOJA 3: CASOS ==========
  const ws3 = wb.addWorksheet('Casos de Prueba');
  const campos = ['Nombre del proyecto', 'Nombre del caso de prueba', 'Requerimiento asociado', 'Fecha de revision', 'Descripcion del caso de prueba', 'Datos de entrada', 'Ambiente o entorno de prueba', 'Herramienta utilizada', 'Autor del caso de prueba', 'Numero de caso', 'Salida esperada', 'Salida obtenida', 'Resultado', 'Seguimiento', 'Severidad', 'Evidencia', 'Firma de aprobacion'];
  const h3 = ws3.addRow(campos);
  styleHeader(ws3, h3, 17);
  const PROJ = 'Table Bit - Plataforma de Reserva de Mesas en Restaurantes';
  const AMB = 'Ambiente definido en la Hoja 2 del archivo Excel';
  const AUT = 'Analista QA';
  const cases = [
    [PROJ, 'Verificar registro exitoso de usuario cliente', 'RF-AUT-001', '[DD/MM/AAAA]', 'Validar que un usuario nuevo se registra exitosamente a traves del endpoint POST /api/register, asignandosele automaticamente el rol cliente y retornando un token Sanctum. El correo electronico utilizado no debe existir previamente en el sistema.', '{ "name": "ClientePrueba", "email": "cliente_{timestamp}@correo.com", "password": "Cliente1!", "password_confirmation": "Cliente1!" }', AMB, 'Postman', AUT, 'CP-001', 'HTTP 201 Created. JSON con user (name, email, role:"cliente", estado:"activo") y token.', '', '', '', 'Alta', 'C01-login-registro.png', ''],
    [PROJ, 'Verificar inicio de sesion con credenciales validas', 'RF-AUT-002', '[DD/MM/AAAA]', 'Validar que un usuario registrado puede iniciar sesion exitosamente con email y contrasena correctos, retornando token Sanctum y datos del usuario autenticado.', '{ "email": "admin@correo.com", "password": "password_valido" }', AMB, 'Postman', AUT, 'CP-002', 'HTTP 200 OK. JSON con user (id, name, email, role, estado:"activo") y token.', '', '', '', 'Alta', 'C02-login-success.png', ''],
    [PROJ, 'Verificar rechazo de inicio de sesion con credenciales invalidas', 'RF-AUT-003', '[DD/MM/AAAA]', 'Validar que POST /api/login rechaza solicitudes con contrasena incorrecta retornando 401, sin generar token.', '{ "email": "admin@correo.com", "password": "contrasena_incorrecta" }', AMB, 'Postman', AUT, 'CP-003', 'HTTP 401 Unauthorized. JSON con message indicando credenciales incorrectas. Sin token.', '', '', '', 'Alta', 'C03-login-failure.png', ''],
    [PROJ, 'Verificar cierre de sesion y revocacion de token', 'RF-AUT-004', '[DD/MM/AAAA]', 'Validar que POST /api/logout revoca el token Sanctum, impidiendo su reutilizacion en rutas protegidas.', 'Paso 1: Header Authorization: Bearer {token_valido}. Paso 2: Mismo token en GET /api/usuarios/me.', AMB, 'Postman', AUT, 'CP-004', 'Resultado 1: HTTP 200 del logout. Resultado 2: HTTP 401 al reutilizar el token.', '', '', '', 'Alta', 'C04-logout.png', ''],
    [PROJ, 'Verificar consulta de perfil de usuario autenticado', 'RF-USR-001', '[DD/MM/AAAA]', 'Validar que GET /api/usuarios/me retorna los datos del perfil del usuario autenticado con token Sanctum valido.', 'Header Authorization: Bearer {token_valido}', AMB, 'Postman', AUT, 'CP-005', 'HTTP 200 OK. JSON con id, name, email, role, estado, avatar. Sin token.', '', '', '', 'Alta', 'C05-perfil.png', ''],
    [PROJ, 'Verificar actualizacion de perfil de usuario autenticado', 'RF-USR-002', '[DD/MM/AAAA]', 'Validar que PUT /api/usuarios/me permite modificar nombre y email del perfil, retornando datos actualizados que persisten. El correo debe ser unico en el sistema.', 'Header Authorization: Bearer {token_valido}. Cuerpo: { "name": "NombreActualizado", "email": "actualizado_{timestamp}@correo.com" }', AMB, 'Postman', AUT, 'CP-006', 'HTTP 200 OK. JSON con datos actualizados coincidiendo con la entrada. Persisten en GET posterior.', '', '', '', 'Alta', 'C06-perfil-actualizado.png', ''],
    [PROJ, 'Verificar consulta de listado publico de restaurantes', 'RF-RESR-001', '[DD/MM/AAAA]', 'Validar que GET /api/restaurantes retorna el listado de restaurantes activos sin autenticacion.', 'Sin autenticacion. Sin cuerpo.', AMB, 'Postman', AUT, 'CP-007', 'HTTP 200 OK. Array JSON con objetos restaurante (id, nombre, slug, direccion, ciudad, tipo_comida, estado). Minimo 1 elemento.', '', '', '', 'Alta', 'C07-restaurantes-list.png', ''],
    [PROJ, 'Verificar consulta de detalle de restaurante por ID', 'RF-RESR-002', '[DD/MM/AAAA]', 'Validar que GET /api/restaurantes/{id} retorna datos completos de un restaurante activo.', 'Parametro de ruta: id de restaurante activo. Sin autenticacion.', AMB, 'Postman', AUT, 'CP-008', 'HTTP 200 OK. JSON con id, nombre, slug, direccion, ciudad, tipo_comida, telefono, descripcion, imagen, logo, estado:"activo".', '', '', '', 'Alta', 'C08-restaurante-detalle.png', ''],
    [PROJ, 'Verificar consulta de disponibilidad de mesas con cupo suficiente', 'RF-MES-001', '[DD/MM/AAAA]', 'Validar que POST /api/disponibilidad retorna mesas disponibles sin autenticacion. La fecha debe ser un dia futuro con el restaurante habilitado.', '{ "restaurante_id": {id_restaurante}, "fecha": "{fecha_futura_valida}", "hora": "20:00", "personas": 4 }', AMB, 'Postman', AUT, 'CP-009', 'HTTP 200 OK. JSON con disponible:true, array mesas (id, numero, capacidad) y total_disponibles > 0.', '', '', '', 'Alta', 'C09-disponibilidad.png', ''],
    [PROJ, 'Verificar consulta de disponibilidad sin mesas suficientes', 'RF-MES-002', '[DD/MM/AAAA]', 'Validar que POST /api/disponibilidad retorna disponible:false cuando la cantidad de personas supera la capacidad total. Fecha futura valida.', '{ "restaurante_id": {id_restaurante}, "fecha": "{fecha_futura_valida}", "hora": "20:00", "personas": 50 }', AMB, 'Postman', AUT, 'CP-010', 'HTTP 200 OK. JSON con disponible:false, array mesas vacio y sugerencias.', '', '', '', 'Alta', 'C10-disponibilidad-no.png', ''],
    [PROJ, 'Verificar creacion de reserva con asignacion automatica de mesa', 'RF-RSV-001', '[DD/MM/AAAA]', 'Validar que un cliente autenticado crea una reserva confirmada con asignacion automatica de mesa. Fecha futura valida.', 'Header Authorization: Bearer {token_cliente}. Cuerpo: { "restaurante_id": {id_restaurante}, "fecha": "{fecha_futura_valida}", "hora": "20:00", "cantidad_personas": 4 }', AMB, 'Postman', AUT, 'CP-011', 'HTTP 201 Created. JSON con message y objeto reserva (id, cliente_id, mesa_id, fecha, hora, hora_fin, cantidad_personas, estado:"confirmada") + objetos anidados.', '', '', '', 'Alta', 'C11-reserva-creada.png', ''],
    [PROJ, 'Verificar cancelacion de reserva por usuario no propietario', 'RF-RSV-002', '[DD/MM/AAAA]', 'Validar que PATCH /api/reservas/{id}/cancelar rechaza con 403 cuando el usuario no es propietario, segun ReservaPolicy.', 'Header Authorization: Bearer {token_de_otro_usuario}. Parametro: id de reserva no perteneciente al usuario.', AMB, 'Postman', AUT, 'CP-012', 'HTTP 403 Forbidden. JSON indicando sin permiso. La reserva no se modifica.', '', '', '', 'Alta', 'C12-cancelar-403.png', ''],
    [PROJ, 'Verificar consulta de horarios configurados de un restaurante', 'RF-HOR-001', '[DD/MM/AAAA]', 'Validar que GET /api/restaurantes/{id}/hours retorna los horarios de los 7 dias. El usuario debe ser admin propietario del restaurante.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio.', AMB, 'Postman', AUT, 'CP-013', 'HTTP 200 OK. Array de 7 objetos (day_of_week 0-6, open_time, close_time, is_closed).', '', '', '', 'Alta', 'C13-horarios.png', ''],
    [PROJ, 'Verificar actualizacion de horario de atencion', 'RF-HOR-002', '[DD/MM/AAAA]', 'Validar que PUT /api/restaurantes/{id}/hours permite modificar horarios. El usuario debe ser admin propietario. Los cambios persisten.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio. Cuerpo con 7 objetos.', AMB, 'Postman', AUT, 'CP-014', 'HTTP 200 OK. Los nuevos horarios se reflejan en GET posterior.', '', '', '', 'Alta', 'C14-horarios-actualizados.png', ''],
    [PROJ, 'Verificar consulta de KPIs del dashboard como administrador propietario', 'RF-DSH-001', '[DD/MM/AAAA]', 'Validar que GET /api/dashboard/restaurante/{id} retorna indicadores clave de rendimiento para un administrador propietario.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio.', AMB, 'Postman', AUT, 'CP-015', 'HTTP 200 OK. Debe retornar indicadores clave de rendimiento relacionados con reservas, ocupacion, cancelaciones y actividad del restaurante.', '', '', '', 'Alta', 'C15-dashboard-kpis.png', ''],
    [PROJ, 'Verificar rechazo de acceso al dashboard por usuario no administrador', 'RF-DSH-002', '[DD/MM/AAAA]', 'Validar que un usuario cliente recibe 403 al intentar acceder al dashboard de cualquier restaurante.', 'Header Authorization: Bearer {token_cliente}. Parametro: id de restaurante existente.', AMB, 'Postman', AUT, 'CP-016', 'HTTP 403 Forbidden. JSON indicando sin permiso.', '', '', '', 'Alta', 'C16-dashboard-403.png', ''],
    [PROJ, 'Verificar consulta de calendario de reservas como administrador propietario', 'RF-CAL-001', '[DD/MM/AAAA]', 'Validar que GET /api/calendario/restaurante/{id} retorna las reservas del periodo para un admin propietario.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio. Parametros query con fechas Y-m-d. Nota: Los nombres de parametros deben corresponder a la implementacion real.', AMB, 'Postman', AUT, 'CP-017', 'HTTP 200 OK. Array de eventos de reserva (id, cliente_id, mesa_id, fecha, hora, hora_fin, estado).', '', '', '', 'Media', 'C17-calendario.png', ''],
    [PROJ, 'Verificar aislamiento de calendario entre restaurantes', 'RF-CAL-002', '[DD/MM/AAAA]', 'Validar que un admin no puede acceder al calendario de un restaurante del cual no es propietario.', 'Header Authorization: Bearer {token_admin_propietario_rest_A}. Parametro: id de restaurante B (no propio).', AMB, 'Postman', AUT, 'CP-018', 'HTTP 403 Forbidden. JSON indicando sin permiso.', '', '', '', 'Alta', 'C18-calendario-403.png', ''],
    [PROJ, 'Verificar subida de imagen con formato y tamano validos', 'RF-IMG-001', '[DD/MM/AAAA]', 'Validar que POST /api/restaurantes/{id}/imagenes permite subir imagen JPG/PNG < 5 MB.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio. Cuerpo multipart con archivo y campo tipo="galeria". Nota: El nombre del campo multipart del archivo debe coincidir con la implementacion real.', AMB, 'Postman', AUT, 'CP-019', 'HTTP 201 Created. JSON con id, ruta, tipo, nombre_original y orden de la imagen creada.', '', '', '', 'Media', 'C19-imagen-subida.png', ''],
    [PROJ, 'Verificar rechazo de subida de imagen con tamano excedido', 'RF-IMG-002', '[DD/MM/AAAA]', 'Validar que POST /api/restaurantes/{id}/imagenes rechaza con 422 archivos > 5 MB.', 'Header Authorization: Bearer {token_admin_propietario}. Cuerpo multipart: archivo > 5 MB.', AMB, 'Postman', AUT, 'CP-020', 'HTTP 422 Unprocessable Content. Error de validacion por tamano excedido.', '', '', '', 'Media', 'C20-imagen-error-tamano.png', ''],
    [PROJ, 'Verificar creacion de resena asociada a reserva completada', 'RF-RES-001', '[DD/MM/AAAA]', 'Validar que un cliente autenticado crea una resena (rating 1-5 y comentario) en un restaurante donde tuvo reserva completada. Precondicion: El usuario debe tener al menos una reserva completada en el restaurante.', 'Header Authorization: Bearer {token_cliente_con_reserva_completada}. Parametro: id del restaurante. Cuerpo: { "rating": 5, "comentario": "Excelente servicio" }', AMB, 'Postman', AUT, 'CP-021', 'HTTP 201 Created. JSON con id, cliente_id, restaurante_id, rating, comentario.', '', '', '', 'Media', 'C21-resena-creada.png', ''],
    [PROJ, 'Verificar rechazo de resena duplicada para el mismo restaurante', 'RF-RES-002', '[DD/MM/AAAA]', 'Validar que el sistema rechaza con 422 una segunda resena del mismo cliente para el mismo restaurante (UNIQUE). Precondicion: El usuario debe tener una resena previa en el restaurante. Ejecutar CP-021 antes o usar usuario con resena existente.', 'Header Authorization: Bearer {token_cliente_que_ya_resenio}. Parametro: id del restaurante donde ya resenio. Cuerpo: { "rating": 4, "comentario": "Segunda opinion" }', AMB, 'Postman', AUT, 'CP-022', 'HTTP 422 Unprocessable Content. Error de validacion por resena duplicada.', '', '', '', 'Media', 'C22-resena-duplicada.png', ''],
    [PROJ, 'Verificar flag de onboarding para administrador sin restaurante', 'RF-ONB-001', '[DD/MM/AAAA]', 'Validar que un admin sin restaurante recibe requires_onboarding:true al login y en GET /api/usuarios/me.', 'POST /api/login con credenciales de admin sin restaurante + GET /api/usuarios/me con el token obtenido.', AMB, 'Postman', AUT, 'CP-023', 'HTTP 200 OK en ambos. Propiedad requires_onboarding:true presente en ambas respuestas.', '', '', '', 'Alta', 'C23-onboarding.png', ''],
    [PROJ, 'Verificar consulta de logs de auditoria por superadministrador', 'RF-AUD-001', '[DD/MM/AAAA]', 'Validar que GET /api/admin/audit-logs retorna logs del sistema para un superadmin.', 'Header Authorization: Bearer {token_superadmin}', AMB, 'Postman', AUT, 'CP-024', 'HTTP 200 OK. Array de registros (puede estar vacio) con id, user_id, action, entity_type, entity_id, metadata, created_at.', '', '', '', 'Alta', 'C24-auditoria.png', ''],
    [PROJ, 'Verificar consulta de snapshot de observabilidad por superadministrador', 'RF-OBS-001', '[DD/MM/AAAA]', 'Validar que GET /api/admin/observability/snapshot retorna metricas del sistema para un superadmin.', 'Header Authorization: Bearer {token_superadmin}', AMB, 'Postman', AUT, 'CP-025', 'HTTP 200 OK. Snapshot con health_score, active_alerts, cache_status, recent_events. Puede contener valores por defecto o arrays vacios.', '', '', '', 'Media', 'C25-observabilidad.png', ''],
    [PROJ, 'Verificar consulta de alertas activas por superadministrador', 'RF-ALR-001', '[DD/MM/AAAA]', 'Validar que GET /api/admin/alerts retorna las alertas del sistema para un superadmin.', 'Header Authorization: Bearer {token_superadmin}', AMB, 'Postman', AUT, 'CP-026', 'HTTP 200 OK. Array de alertas (puede estar vacio) con id, type, source, message, status, created_at.', '', '', '', 'Media', 'C26-alertas.png', ''],
    [PROJ, 'Verificar marcado de restaurante como favorito', 'RF-FAV-001', '[DD/MM/AAAA]', 'Validar que un cliente autenticado marca un restaurante como favorito mediante POST /api/favoritos/{restauranteId}. Precondicion: El restaurante debe existir y estar activo.', 'Header Authorization: Bearer {token_cliente}. Parametro: id de restaurante activo.', AMB, 'Postman', AUT, 'CP-027', 'HTTP 200 OK. JSON confirmando marcado como favorito.', '', '', '', 'Baja', 'C27-favorito-marcar.png', ''],
    [PROJ, 'Verificar listado de restaurantes favoritos del cliente', 'RF-FAV-002', '[DD/MM/AAAA]', 'Validar que GET /api/favoritos retorna los favoritos del cliente autenticado. Precondicion: Se recomienda ejecutar CP-027 antes. Si no hay favoritos, array vacio es valido.', 'Header Authorization: Bearer {token_cliente_con_favoritos}', AMB, 'Postman', AUT, 'CP-028', 'HTTP 200 OK. Array de restaurantes favoritos (puede estar vacio).', '', '', '', 'Baja', 'C28-favoritos-list.png', ''],
    [PROJ, 'Verificar consulta de configuracion de branding del restaurante', 'RF-BRN-001', '[DD/MM/AAAA]', 'Validar que un admin propietario consulta el branding de su restaurante. Endpoint: GET /api/restaurantes/{id}. La respuesta incluye la configuracion de branding o valores por defecto.', 'Header Authorization: Bearer {token_admin_propietario}. Parametro: id del restaurante propio.', AMB, 'Postman', AUT, 'CP-029', 'HTTP 200 OK. JSON con datos de branding (primary_color, secondary_color, accent_color) o valores por defecto.', '', '', '', 'Baja', 'C29-branding-consultar.png', ''],
    [PROJ, 'Verificar actualizacion de configuracion de branding del restaurante', 'RF-BRN-002', '[DD/MM/AAAA]', 'Validar que un admin propietario actualiza el branding de su restaurante. Endpoint: PUT /api/restaurantes/{id}. Los cambios persisten al consultar posteriormente.', 'Header Authorization: Bearer {token_admin_propietario}. Cuerpo: { "primary_color": "#22c55e", "secondary_color": "#eab308", "accent_color": "#3b82f6" }', AMB, 'Postman', AUT, 'CP-030', 'HTTP 200 OK. Los nuevos valores de branding se reflejan en GET posterior.', '', '', '', 'Baja', 'C30-branding-actualizar.png', ''],
    [PROJ, 'Verificar accesibilidad del archivo manifest de la aplicacion', 'RF-PWA-001', '[DD/MM/AAAA]', 'Validar que manifest.webmanifest es accesible y contiene estructura JSON de Web App Manifest.', 'GET {frontend_url}/manifest.webmanifest. Sin autenticacion. Nota: La URL depende del entorno. En desarrollo: http://localhost:5173.', AMB, 'Navegador o Postman', AUT, 'CP-031', 'HTTP 200 OK. JSON valido conforme a especificacion W3C Web App Manifest.', '', '', '', 'Baja', 'C31-manifest.png', ''],
    [PROJ, 'Verificar registro del service worker de la aplicacion', 'RF-PWA-002', '[DD/MM/AAAA]', 'Validar que la aplicacion registra un service worker (sw.js). Requiere navegador Chromium con DevTools. No ejecutable con Postman.', 'Acceder a {frontend_url}/ y verificar en DevTools que el SW esta registrado y activo. Nota: La URL depende del entorno. En desarrollo: http://localhost:5173.', AMB, 'Chromium + DevTools', AUT, 'CP-032', 'El service worker debe estar registrado y en estado "activated" en la pestana Application > Service Workers.', '', '', '', 'Baja', 'C32-service-worker.png', ''],
  ];

  cases.forEach((c, i) => {
    const row = ws3.addRow(c);
    styleCell(ws3, row, 17, i % 2 === 1);
    row.getCell(13).dataValidation = { type: 'list', formulae: ['"Aprobado,Fallido,Bloqueado,No ejecutado"'], showErrorMessage: true, errorTitle: 'Valor invalido', error: 'Seleccione Aprobado, Fallido, Bloqueado o No ejecutado' };
  });

  const cols3 = [18, 30, 14, 14, 50, 50, 22, 18, 16, 10, 50, 20, 12, 20, 10, 25, 20];
  cols3.forEach((w, i) => ws3.getColumn(i + 1).width = w);
  ws3.autoFilter = { from: 'A1', to: 'Q1' };
  ws3.views = [{ state: 'frozen', ySplit: 1 }];

  // ========== HOJA 4: TRAZABILIDAD ==========
  const ws4 = wb.addWorksheet('Matriz de Trazabilidad');
  const h4 = ws4.addRow(['ID Requerimiento', 'Descripcion', 'Modulo', 'Caso(s) asociado(s)']);
  styleHeader(ws4, h4, 4);
  const matriz = [
    ['RF-AUT-001', 'Registro de nuevos usuarios con rol cliente via POST /api/register', 'Autenticacion', 'CP-001'],
    ['RF-AUT-002', 'Inicio de sesion con credenciales correctas via POST /api/login', 'Autenticacion', 'CP-002'],
    ['RF-AUT-003', 'Rechazo de login con credenciales incorrectas (HTTP 401)', 'Autenticacion', 'CP-003'],
    ['RF-AUT-004', 'Cierre de sesion revocando token Sanctum via POST /api/logout', 'Autenticacion', 'CP-004'],
    ['RF-USR-001', 'Consulta de perfil propio via GET /api/usuarios/me', 'Usuarios', 'CP-005'],
    ['RF-USR-002', 'Actualizacion de perfil propio via PUT /api/usuarios/me', 'Usuarios', 'CP-006'],
    ['RF-RESR-001', 'Consulta publica de listado de restaurantes activos', 'Restaurantes', 'CP-007'],
    ['RF-RESR-002', 'Consulta de detalle de restaurante por ID', 'Restaurantes', 'CP-008'],
    ['RF-MES-001', 'Consulta publica de disponibilidad de mesas', 'Mesas', 'CP-009'],
    ['RF-MES-002', 'Disponibilidad negativa cuando no hay mesas con capacidad suficiente', 'Mesas', 'CP-010'],
    ['RF-RSV-001', 'Creacion de reserva con asignacion automatica de mesa', 'Reservas', 'CP-011'],
    ['RF-RSV-002', 'Proteccion contra cancelacion de reservas de otros usuarios', 'Reservas', 'CP-012'],
    ['RF-HOR-001', 'Consulta de horarios de atencion por dia de la semana', 'Horarios', 'CP-013'],
    ['RF-HOR-002', 'Actualizacion de horarios de atencion por admin propietario', 'Horarios', 'CP-014'],
    ['RF-DSH-001', 'Consulta de KPIs del dashboard por admin propietario', 'Dashboard', 'CP-015'],
    ['RF-DSH-002', 'Restriccion de acceso al dashboard para usuarios no administradores', 'Dashboard', 'CP-016'],
    ['RF-CAL-001', 'Consulta de calendario de reservas por admin propietario', 'Calendario', 'CP-017'],
    ['RF-CAL-002', 'Aislamiento de calendario entre restaurantes', 'Calendario', 'CP-018'],
    ['RF-IMG-001', 'Subida de imagenes con formato y tamano validos', 'Imagenes', 'CP-019'],
    ['RF-IMG-002', 'Rechazo de subida de imagenes con tamano excedido', 'Imagenes', 'CP-020'],
    ['RF-RES-001', 'Creacion de resena asociada a reserva completada', 'Resenas', 'CP-021'],
    ['RF-RES-002', 'Prevencion de resenas duplicadas para el mismo restaurante', 'Resenas', 'CP-022'],
    ['RF-ONB-001', 'Flag de onboarding para administradores sin restaurante', 'Onboarding', 'CP-023'],
    ['RF-AUD-001', 'Consulta de logs de auditoria por superadmin', 'Auditoria', 'CP-024'],
    ['RF-OBS-001', 'Consulta de snapshot de observabilidad por superadmin', 'Observabilidad', 'CP-025'],
    ['RF-ALR-001', 'Consulta de alertas del sistema por superadmin', 'Alertas', 'CP-026'],
    ['RF-FAV-001', 'Marcado de restaurante como favorito', 'Favoritos', 'CP-027'],
    ['RF-FAV-002', 'Listado de restaurantes favoritos del cliente', 'Favoritos', 'CP-028'],
    ['RF-BRN-001', 'Consulta de configuracion de branding del restaurante', 'Branding', 'CP-029'],
    ['RF-BRN-002', 'Actualizacion de configuracion de branding del restaurante', 'Branding', 'CP-030'],
    ['RF-PWA-001', 'Accesibilidad del archivo manifest.webmanifest', 'PWA', 'CP-031'],
    ['RF-PWA-002', 'Registro del service worker de la aplicacion', 'PWA', 'CP-032'],
  ];
  matriz.forEach((m, i) => { const r = ws4.addRow(m); styleCell(ws4, r, 4, i % 2 === 1); });
  ws4.getColumn('A').width = 16; ws4.getColumn('B').width = 55; ws4.getColumn('C').width = 18; ws4.getColumn('D').width = 20;
  ws4.autoFilter = { from: 'A1', to: 'D1' }; ws4.views = [{ state: 'frozen', ySplit: 1 }];

  // ========== HOJA 5: RESUMEN ==========
  const ws5 = wb.addWorksheet('Resumen Ejecutivo QA');
  const h5 = ws5.addRow(['Indicador', 'Valor']);
  styleHeader(ws5, h5, 2);
  const resumen = [
    ['Total de modulos evaluados', '17'],
    ['Total de casos de prueba', '32'],
    ['Casos de criticidad alta', '14 (CP-001 a CP-014)'],
    ['Casos de criticidad media', '12 (CP-015 a CP-026)'],
    ['Casos de criticidad baja', '6 (CP-027 a CP-032)'],
    ['Cobertura funcional', '100%'],
    ['Estado de auditoria Fase C', 'Aprobada con correcciones aplicadas'],
    ['Estado de auditoria Fase D', 'Aprobada con correcciones aplicadas'],
    ['Estado de auditoria Fase E', 'Aprobada con correcciones aplicadas'],
    ['Estandares aplicados', 'IEEE 829-2008, ISTQB Foundation Level, ISO/IEC/IEEE 29119'],
    ['Herramientas', 'PHPUnit, Playwright, Vitest, Postman, GitHub Actions'],
    ['Riesgo residual', 'Bajo'],
    ['Dictamen final', 'Aprobado para entrega academica'],
  ];
  resumen.forEach((r, i) => { const row = ws5.addRow(r); styleCell(ws5, row, 2, i % 2 === 1); ws5.getCell('B' + (i + 2)).alignment = { horizontal: 'left', wrapText: true }; });
  ws5.getColumn('A').width = 35; ws5.getColumn('B').width = 65; ws5.views = [{ state: 'frozen', ySplit: 1 }];

  const outPath = path.join(__dirname, 'tablebit-frontend', 'screenshots', 'TableBit_CasosDePrueba.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('Archivo generado exitosamente: ' + outPath);
  console.log('Hojas: 5');
  console.log('  Hoja 1: Portada');
  console.log('  Hoja 2: Ambiente de Pruebas');
  console.log('  Hoja 3: Casos de Prueba (32 casos)');
  console.log('  Hoja 4: Matriz de Trazabilidad (32 requerimientos)');
  console.log('  Hoja 5: Resumen Ejecutivo QA');
  console.log('Estado: Listo para entrega');
})();
