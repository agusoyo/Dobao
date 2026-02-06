# Especificación Funcional: Sistema de Gestión de Reservas - Dobao Gourmet

## 1. Resumen del Proyecto
Dobao Gourmet es una aplicación web premium diseñada para la gestión integral de un Txoko (sociedad gastronómica privada) ubicado en Vigo. El sistema permite a los clientes finales solicitar reservas de espacio para eventos privados y apuntarse a experiencias gastronómicas (catas de vino), mientras proporciona al administrador herramientas avanzadas para la gestión de disponibilidad, control de costes, aforos y cierres de calendario.

---

## 2. Arquitectura Técnica
- **Frontend:** React 19 con TypeScript.
- **Estilos:** Tailwind CSS con tipografías premium (Playfair Display para serif, Inter para sans).
- **Base de Datos:** Supabase (PostgreSQL) - *Migración planificada a MySQL*.
- **Integración de IA:** Google Gemini API para asesoramiento en la planificación de eventos (cantidades y organización).
- **Utilidades:** 
  - `date-fns` para lógica compleja de calendarios.
  - `xlsx` y `jspdf` para generación de informes administrativos.

---

## 3. Módulos Funcionales

### Módulo 1: Portal Público (Home)
Este módulo gestiona la primera impresión y la navegación principal.
- **Hero Escindido:** Diseño visual que divide la pantalla en dos grandes áreas interactivas: "El Arte de la Mesa" (Reservas) y "El Arte del Vino" (Catas).
- **Notificador de Próxima Cata:** Widget flotante que detecta automáticamente el próximo evento en el calendario y muestra un aviso de "Últimas plazas" si el aforo es crítico (<= 4 plazas).
- **Manifiesto:** Sección estética que refuerza el valor de marca del Txoko.

### Módulo 2: Sistema de Reservas de Espacio (Eventos Privados)
Gestiona el alquiler del local completo.
- **Calendario Maestro:** 
  - Visualización de estados: Libre, Parcialmente Ocupado (un turno libre), Agotado e Inhabilitado.
  - Sincronización en tiempo real con eventos de catas (una cata ocupa un turno del local).
- **Selector de Turnos:** Selección obligatoria entre **Comida (MIDDAY)** o **Cena (NIGHT)**.
  - *Regla de validación:* Deshabilitación automática de botones si el slot ya está comprometido en la base de datos.
- **Configurador de Servicios:** Checkbox para servicios adicionales (Catering, Multimedia, Vinoteca).
  - *Lógica de exclusión:* Los barriles de cerveza (Estrella vs 1906) son mutuamente excluyentes.
- **Flujo de Notificación:** Al completar la solicitud, se registra en Supabase y se dispara un `mailto` preconfigurado para comunicación directa.

### Módulo 3: Experiencias Gourmet (Catas)
Módulo destinado a la venta de plazas para eventos organizados.
- **Catálogo de Eventos:** Tarjetas con fecha, precio por persona y descripción técnica de la sesión.
- **Gestor de Plazas:** Selector de cantidad de asistentes que valida dinámicamente el aforo restante antes de permitir la reserva.
- **Confirmación:** Registro de asistentes vinculado a un ID de evento específico.

### Módulo 4: Panel de Administración (Dashboard)
Centro de control operativo protegido por contraseña (`admin2025`).
- **Gestión de Reservas Privadas:** 
  - Tabla interactiva con filtros por año y mes.
  - **Edición Financiera:** Permite al admin introducir el coste real del evento y el depósito entregado, calculando el saldo pendiente automáticamente.
  - **Cambio de Estado:** Paso manual de `PENDING` a `CONFIRMED` o `CANCELLED`.
- **Reporting:** Botones de exportación rápida a **Excel** (datos completos) y **PDF** (resumen ejecutivo).
- **Gestión de Asistentes:** Desglose detallado de quién se ha apuntado a cada cata, con opción de editar sus depósitos o eliminar registros.

### Módulo 5: Configuración de Sistema
- **Editor de Catas:** Interfaz para publicar nuevos eventos de vino, definiendo aforo, precio y descripción.
- **Bloqueador de Fechas:** Herramienta para cerrar el local en fechas específicas (festivos, mantenimiento), anulando la disponibilidad en el calendario público independientemente de si hay reservas previas.

---

## 4. Reglas de Negocio Críticas
1. **Conflicto de Turno:** El sistema no permite que una reserva privada y una cata coincidan en el mismo día y mismo turno.
2. **Prioridad Administrativa:** Los días en la tabla `blocked_days` tienen prioridad absoluta sobre cualquier otra lógica de disponibilidad.
3. **Control de Aforo:** Un asistente no puede reservar más plazas de las que queden disponibles en el contador `max_capacity - current_attendees`.
4. **Persistencia:** Todas las acciones de borrado en el panel admin son definitivas tras confirmación del usuario para mantener la integridad de la base de datos.

---

## 5. Esquema de Datos (Entidades)
- **`reservations`**: `id, date, slot, customer_name, email, phone, guests, purpose, services(JSON), event_cost, deposit, status`.
- **`wine_tastings`**: `id, date, slot, name, max_capacity, price_per_person, description`.
- **`tasting_attendees`**: `id, tasting_id, name, email, phone, seats, deposit`.
- **`blocked_days`**: `id, date, reason`.
