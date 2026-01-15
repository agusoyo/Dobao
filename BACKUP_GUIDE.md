
# Guía de Restauración - Dobao Gourmet

Este documento detalla cómo restaurar el sistema a un punto anterior.

## 1. Puntos de Restauración del Código
Última versión estable: **v1.6.0 - Gestión de Días Bloqueados**.

## 2. Restauración de Base de Datos (Supabase)

### Tabla de Reservas (Privadas):
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

### Tabla de Catas de Vinos (Eventos):
```sql
CREATE TABLE wine_tastings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  slot TEXT NOT NULL DEFAULT 'NIGHT',
  name TEXT NOT NULL,
  max_capacity INTEGER NOT NULL,
  price_per_person NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Tabla de Asistentes a Catas:
```sql
CREATE TABLE tasting_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tasting_id UUID REFERENCES wine_tastings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  deposit NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Tabla de Días Bloqueados:
```sql
CREATE TABLE blocked_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

## 3. Credenciales Críticas
- **Admin Password:** `admin2025`
