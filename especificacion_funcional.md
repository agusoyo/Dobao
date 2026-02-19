# Especificación Funcional: Sistema de Gestión Dobao Gourmet

## 1. Introducción
**Dobao Gourmet** es una plataforma integral diseñada para la gestión de un Txoko premium en Vigo. El sistema permite la comercialización del local para eventos privados y la gestión de experiencias de cata de vinos, integrando una capa administrativa para el control total de operaciones, finanzas y disponibilidad.

---

## 2. Módulo 1: Portal de Usuario y Navegación (Landing)
Este módulo gestiona la identidad visual y el acceso a los servicios.

*   **Navegación Dual (Hero Split):** Interfaz dividida en la página de inicio que permite al usuario elegir entre "Reserva de Local" (Privado) y "Experiencias Gourmet" (Público).
*   **Asesor de Planificación IA (Gemini):** Integración con Google Gemini para proporcionar consejos automáticos sobre organización y cantidades de comida basados en el número de invitados y el motivo del evento.
*   **Notificador de Eventos Próximos:** Widget dinámico en la Home que muestra la próxima cata disponible con alertas de "Últimas plazas" basadas en el aforo real.
*   **Galería Multimedia:** Visualizador de alta resolución con funcionalidad de lightbox para mostrar las instalaciones.

---

## 3. Módulo 2: Gestión de Reservas de Local (Privado)
Módulo core para el alquiler íntegro del espacio.

*   **Calendario Maestro de Disponibilidad:** Visualización de días libres, parcialmente ocupados (1 de 2 turnos), totalmente ocupados o inhabilitados administrativamente.
*   **Lógica de Turnos:** Selección entre turno de Comida (MIDDAY) o Cena (NIGHT). El sistema valida automáticamente que el turno no esté ocupado por otra reserva o por una cata programada.
*   **Tarifas Dinámicas Inteligentes:** 
    *   **Precios Base:** Configuración por día de la semana (ej. precios diferentes para fin de semana vs diario).
    *   **Precios Especiales:** Sobrescritura manual para fechas específicas (ej. Navidad, Nochevieja, festivos locales).
*   **Configurador de Servicios Extra:** 
    *   Servicios incluidos por defecto (Limpieza profesional).
    *   Servicios opcionales (Catering, Multimedia, Vinoteca).
    *   Gestión de exclusividad de barriles (Selección entre Estrella Galicia o 1906).
*   **Flujo de Solicitud:** Generación automática de correo electrónico (`mailto`) con el resumen detallado para el cliente y el administrador.

---

## 4. Módulo 3: Experiencias Gastronómicas (Catas Públicas)
Gestión de eventos públicos por plazas individuales.

*   **Catálogo de Catas:** Listado dinámico de sesiones activas con descripción enológica, precio y fecha.
*   **Control de Aforo en Tiempo Real:** Validación de plazas disponibles antes de permitir la reserva, impidiendo sobrepasar la capacidad máxima del local.
*   **Formulario de Inscripción:** Captura de datos de contacto y selector de cantidad de plazas.
*   **Notificación de Reserva:** Envío de confirmación vía email detallando el evento seleccionado y el coste total.

---

## 5. Módulo 4: Panel de Administración (Backoffice)
Centro de control operativo protegido por credenciales seguras.

*   **Dashboard de Reservas:** Tabla interactiva con búsqueda y filtrado avanzado por año, mes y día.
*   **Gestión Financiera:** 
    *   Edición de costes totales por evento.
    *   Registro de depósitos/fianzas entregados.
    *   Cálculo automático de saldo pendiente.
*   **Control de Estados:** Gestión de estados de reserva (Pendiente, Validado, Cancelado).
*   **Validación con Notificación:** Al confirmar una reserva, el sistema genera automáticamente un correo de confirmación con texto comercial personalizado.
*   **Reporting y Exportación:** Generación de informes en formatos Excel (datos planos) y PDF (resumen ejecutivo con formato profesional).
*   **Vista de Calendario Administrativo:** Interfaz visual para supervisar la ocupación mensual y gestionar estados de turnos rápidamente.

---

## 6. Módulo 5: Configuración del Sistema
Herramientas para la personalización y mantenimiento del negocio.

*   **Gestor de Catas (Editor):** Creación y edición de eventos de vino, definición de aforos y precios por sesión.
*   **Gestor de Asistentes:** Listado detallado de personas inscritas por evento de cata para control de pagos y asistencia.
*   **Configuración de Tarifas:** Interfaz dedicada para definir la tabla de precios semanales y gestionar excepciones de calendario.
*   **Bloqueo de Calendario:** Herramienta para inhabilitar días específicos por mantenimiento, cierre o vacaciones, anulando la disponibilidad pública.

---

## 7. Reglas de Negocio y Requerimientos Técnicos
*   **Sincronización de Turnos:** Una cata organizada consume un turno del local, impidiendo reservas privadas en ese mismo slot para evitar colisiones.
*   **Seguridad:** Persistencia de datos mediante Supabase (PostgreSQL) con acceso restringido a las tablas críticas.
*   **Responsividad:** Diseño adaptable para asegurar una experiencia óptima tanto en dispositivos móviles (reservas de clientes) como en tablets/escritorio (gestión admin).
*   **IA de Soporte:** El motor de Gemini API requiere configuración de clave de entorno para el asesoramiento dinámico.
