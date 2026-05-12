# Frontend Developer Agent

## Perfil
Especialista en React 18, TypeScript, Tailwind CSS, shadcn/ui y Vite.

## Competencias
- Desarrollo de componentes React con TypeScript
- Diseño de UI con Tailwind CSS y shadcn/ui
- Gestión de estado (React Query, Context API)
- Enrutamiento con React Router 6
- Code-splitting y lazy loading
- PWA y SEO

## Stack Tecnológico
```
React 18 | TypeScript | Tailwind CSS | shadcn/ui | Vite | React Router 6 | React Query
```

## Convenciones de Código

### Estructura de Página
```tsx
import { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useSEO } from "@/hooks/useSEO";
import StructuredData from "@/components/StructuredData";

const MiPagina = () => {
  useSEO({
    title: "Page Title",
    description: "Page description",
  });

  return (
    <MainLayout>
      {/* Contenido */}
      <StructuredData data={{ /* JSON-LD */ }} />
    </MainLayout>
  );
};

export default MiPagina;
```

### Code Splitting (App.tsx)
```tsx
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";

const Home = lazy(() => import("./pages/Home"));

<Suspense fallback={<Loader text="Cargando..." />}>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</Suspense>
```

### Diseño System
- Headings: **Playfair Display**
- Body: **DM Sans**
- Primary: `green (#22c55e)`
- Secondary: `gold (#eab308)`

### Estructura de Archivos
```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # MainLayout, DashboardLayout
│   ├── RestaurantCard.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── MisReservas.tsx
│   ├── RestauranteDetalle.tsx
│   └── dashboard/
│       ├── Dashboard.tsx
│       ├── GestionMesas.tsx
│       ├── CalendarioReservas.tsx
│       └── ListadoReservas.tsx
├── hooks/
│   ├── useSEO.ts
│   ├── usePWA.ts
│   └── useApi.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   └── restauranteService.ts
└── layouts/
    ├── MainLayout.tsx
    └── DashboardLayout.tsx
```

## Comandos Útiles
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Type check
npm run type-check || true

# Linting
npm run lint
```

## API Endpoints Principales
```
Auth:
POST /api/register
POST /api/login
POST /api/logout

Restaurantes:
GET  /api/restaurantes
GET  /api/restaurantes/{id}
GET  /api/buscar-restaurantes
GET  /api/restaurantes/{id}/resenas

Reservas:
POST /api/reserva-automatica
GET  /api/mis-reservas
PATCH /api/reservas/{id}/cancelar
GET  /api/disponibilidad

Dashboard (admin):
GET  /api/dashboard/restaurante/{id}
GET  /api/calendario/restaurante/{id}
```

## PWA
- Manifest: `public/manifest.json`
- Service Worker: `public/sw.js`
- Hook: `hooks/usePWA.ts` para install prompt

## SEO
- Meta tags en `index.html`
- Hook `useSEO` para actualización dinámica
- StructuredData component para JSON-LD