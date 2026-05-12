# Reglas de Código React/TypeScript

## TypeScript Style Guide

### Type Definitions
```typescript
// ✓ Correcto
interface Restaurante {
  id: number;
  nombre: string;
  direccion: string;
  ciudad?: string;
  tipo_comida?: string;
  capacidad_total?: number;
}

// Usar type para uniones
type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';

// Props de componente
interface Props {
  restaurante: Restaurante;
  onSelect?: (id: number) => void;
  isLoading?: boolean;
}
```

### Evitar `any`
```typescript
// ✗ Incorrecto
const handleClick = (e: any) => { };

// ✓ Correcto
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };

// Si realmente no conoces el tipo
const handleData = (data: unknown) => {
  const typed = data as Restaurante;
};
```

## Componentes

### Estructura
```tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
}

const MiComponente = ({ title }: Props) => {
  const [localState, setLocalState] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: async () => {
      const response = await api.getData();
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => api.saveData(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key'] });
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenido */}
      </CardContent>
    </Card>
  );
};

export default MiComponente;
```

### Reglas
- Usar hooks al inicio del componente
- Tipar todas las props
- Mostrar estados de carga/error
- Usar `useCallback` para callbacks en `useEffect`
- Usar `useMemo` para cálculos pesados

## Hooks Personalizados

### Estructura
```typescript
// useCustomHook.ts
import { useState, useEffect } from "react";

interface UseCustomHookOptions {
  interval?: number;
  autoStart?: boolean;
}

export function useCustomHook(options: UseCustomHookOptions = {}) {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(options.autoStart ?? false);

  useEffect(() => {
    if (!loading) return;

    const fetchData = async () => {
      // Lógica
    };

    fetchData();
  }, [loading]);

  return { data, setData, loading, setLoading };
}
```

## React Query

### Patrones

```typescript
// GET - useQuery
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['restaurantes', filtros],
  queryFn: () => restauranteService.buscar(filtros),
  enabled: !!filtros.ciudad, // Condicional
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// POST/PUT/DELETE - useMutation
const mutation = useMutation({
  mutationFn: (payload) => reservaService.create(payload),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['reservas'] });
    toast.success("Reserva creada");
  },
  onError: (error) => {
    toast.error(handleApiError(error));
  },
});

// Usar mutation.mutateAsync si necesitas await
const handleSubmit = async () => {
  try {
    await mutation.mutateAsync(payload);
    // Continuar después del éxito
  } catch (e) {
    // Manejar error
  }
};
```

## Servicios API

### Estructura
```typescript
// api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Error de conexión";
  }
  return "Error inesperado";
};

export default api;
```

```typescript
// service.ts
import api from "./api";
import type { Restaurante } from "./types";

export const restauranteService = {
  getAll: async (): Promise<Restaurante[]> => {
    const response = await api.get("/restaurantes");
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<Restaurante> => {
    const response = await api.get(`/restaurantes/${id}`);
    return response.data.data || response.data;
  },

  buscar: async (params: Record<string, string>): Promise<Restaurante[]> => {
    const response = await api.get("/buscar-restaurantes", { params });
    return response.data.data || response.data;
  },
};
```

## CSS/Tailwind

### Clases
```tsx
// ✗ Incorrecto - clases largas sin estructura
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">

// ✓ Correcto - organizado por propósito
<div className="
  flex items-center justify-between
  p-4
  bg-white rounded-lg shadow-md
  border border-border
  hover:shadow-lg
  transition-all duration-300
">
```

### Responsive
```tsx
// Usar prefijos sm:, md:, lg:, xl:
// Mobile first
<button className="
  px-4 py-2          // móvil
  sm:px-6 sm:py-3    // tablet
  lg:px-8 lg:py-4    // desktop
">
```

## Imports

### Orden
1. React/hooks
2. Librerías externas
3. Componentes UI (shadcn)
4. Componentes propios
5. Context/Hooks propios
6. Servicios/Utils
7. Tipos

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Card from "@/components/Card";

import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { restauranteService } from "@/services/restauranteService";
import type { Restaurante } from "@/types";
```

## Archivos y Carpetas

```
src/
├── components/
│   ├── ui/              # shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── layout/
│   │   ├── MainLayout.tsx
│   │   └── DashboardLayout.tsx
│   └── *.tsx
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   └── dashboard/
├── hooks/
│   ├── useSEO.ts
│   ├── usePWA.ts
│   └── useApi.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   └── restauranteService.ts
├── context/
│   └── AuthContext.tsx
├── layouts/
├── types/
│   └── index.ts
├── lib/
│   └── utils.ts
└── App.tsx
```

## Código Duplicado

### Extraer a hooks o componentes
```tsx
// ✗ Repetir lógica
const Card1 = () => {
  const [loading, setLoading] = useState(true);
  // ... lógica
};

const Card2 = () => {
  const [loading, setLoading] = useState(true);
  // ... misma lógica
};

// ✓ Componente reutilizable
const LoadingCard = ({ onRetry }) => {
  return (
    <Card className="p-8 text-center">
      <Loader />
      <Button onClick={onRetry}>Reintentar</Button>
    </Card>
  );
};
```