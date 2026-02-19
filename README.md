# Dobao Gourmet | Reservas Privadas

## Descripción General

"Dobao Gourmet | Reservas Privadas" es un sistema de gestión de reservas integral diseñado para un Txoko vasco tradicional. La aplicación facilita la reserva de espacios privados para eventos, la gestión de catas de vino y la administración completa por parte del personal.

## Características Principales

### Para Usuarios (Público)

*   **Página de Inicio (Home):** Una atractiva página de inicio que presenta el Txoko, sus servicios y un acceso rápido a las funcionalidades principales.
*   **Calendario de Reservas:** Un calendario interactivo donde los usuarios pueden ver la disponibilidad de fechas y franjas horarias (día/noche).
*   **Formulario de Reserva:** Un formulario detallado para que los usuarios soliciten reservas, especificando número de invitados, propósito del evento, comentarios y servicios adicionales (catering, limpieza, multimedia, vinoteca, cerveza).
*   **Visualización de Catas de Vino:** Los usuarios pueden ver las próximas catas de vino disponibles, incluyendo detalles como nombre, fecha, capacidad y precio por persona.
*   **Galería:** Una sección para mostrar imágenes del Txoko y eventos pasados.

### Para Administradores

*   **Panel de Administración (Admin Dashboard):** Una interfaz centralizada para gestionar todas las operaciones del Txoko.
*   **Gestión de Reservas:** Visualización, aprobación, rechazo, edición de costos y depósitos, y eliminación de reservas existentes.
*   **Configuración de Catas de Vino:** Creación, edición y eliminación de eventos de cata de vino, incluyendo detalles como capacidad máxima y precio.
*   **Configuración de Días Bloqueados:** Capacidad para bloquear fechas específicas en el calendario, impidiendo nuevas reservas.
*   **Configuración de Precios:** Gestión de tarifas semanales y precios especiales para fechas específicas.
*   **Vista de Calendario de Administración:** Una vista de calendario dedicada para administradores, mostrando todas las reservas y catas de vino.

## Tecnologías Utilizadas

*   **Frontend:** React con TypeScript
*   **Estilizado:** Tailwind CSS
*   **Base de Datos:** Supabase (para autenticación y almacenamiento de datos)
*   **Fechas:** `date-fns`
*   **Generación de PDFs:** `jspdf`, `jspdf-autotable`
*   **Manejo de Hojas de Cálculo:** `xlsx`
*   **API de Google:** `@google/genai` (para posibles futuras integraciones de IA)

## Estructura del Proyecto

El proyecto sigue una estructura modular para facilitar la gestión y escalabilidad:

*   `/src/App.tsx`: Componente principal de la aplicación que maneja el enrutamiento y el estado global.
*   `/src/components/`: Contiene todos los componentes reutilizables de la interfaz de usuario.
*   `/src/services/`: Aloja la lógica para interactuar con servicios externos (Supabase, Gemini API).
*   `/src/types.ts`: Definiciones de tipos TypeScript para las entidades de la aplicación (reservas, catas, etc.).
*   `/src/constants.ts`: Constantes de configuración de la aplicación.
*   `/index.html`: Archivo HTML principal.
*   `/index.tsx`: Punto de entrada de la aplicación React.
*   `/metadata.json`: Metadatos de la aplicación.
*   `/package.json`: Gestión de dependencias y scripts.
*   `/vite.config.ts`: Configuración de Vite.

## Instalación y Ejecución Local

Para configurar y ejecutar el proyecto localmente, siga estos pasos:

1.  **Clonar el repositorio:**

    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd dobao-gourmet
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar Supabase:**

    *   Cree un proyecto en Supabase.
    *   Configure las tablas `reservations`, `wine_tastings`, `tasting_attendees`, `blocked_days`, `weekly_prices` y `special_prices` con los esquemas adecuados.
    *   Obtenga su `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

4.  **Configurar variables de entorno:**

    Cree un archivo `.env` en la raíz del proyecto y añada:

    ```env
    VITE_SUPABASE_URL="TU_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="TU_SUPABASE_ANON_KEY"
    VITE_ADMIN_PASSWORD="TU_CONTRASEÑA_ADMIN"
    ```

5.  **Iniciar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

    La aplicación estará disponible en `http://localhost:3000`.

## Uso

*   **Modo Usuario:** Navegue por el calendario, seleccione una fecha y franja horaria, y rellene el formulario de reserva.
*   **Modo Administrador:** Acceda al panel de administración introduciendo la contraseña configurada. Desde allí, podrá gestionar todos los aspectos del Txoko.

## Contribución

Las contribuciones son bienvenidas. Por favor, abra un 'issue' o envíe un 'pull request'.

## Licencia

[Especificar licencia, e.g., MIT]
