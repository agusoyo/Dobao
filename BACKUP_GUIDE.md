
# Guía de Restauración - Dobao Gourmet

Este documento detalla cómo restaurar el sistema a un punto anterior.

## 1. Puntos de Restauración del Código
Para restaurar el código, copia el contenido de los archivos listados en el historial de este chat. 
Última versión estable: **v1.2.0 - Exportación Excel/PDF y Costes Añadidos**.

## 2. Restauración de Base de Datos (Supabase)
Si pierdes el acceso a la base de datos o borras tablas por error, sigue estos pasos:

### Crear la estructura de nuevo:
Ejecuta este SQL en el editor de Supabase:
```sql
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  slot TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INTEGER DEFAULT 10,
  purpose TEXT,
  comments TEXT,
  event_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  services JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Importar Datos:
Desde el panel de Supabase, usa la opción **"Import data from CSV"** en la tabla `reservations` para cargar tu último backup manual.

## 3. Credenciales Críticas
- **Supabase URL:** `https://otaqbnxfiufpffpcltvf.supabase.co`
- **Supabase Key:** (Ver archivo `services/supabaseClient.ts`)
- **Admin Password:** `admin2025`
