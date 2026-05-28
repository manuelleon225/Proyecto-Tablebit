import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import type { Restaurante } from "@/types/restaurante";
import { useAuth } from "@/context/AuthContext";

export interface RestauranteContextType {
  selectedRestauranteId: number | null;
  setSelectedRestauranteId: (id: number) => void;
  misRestaurantes: Restaurante[];
  restauranteActual: Restaurante | null;
  isLoading: boolean;
}

export const RestauranteContext = createContext<RestauranteContextType | undefined>(undefined);

export const RestauranteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user && ["admin", "admin_restaurante", "superadmin"].includes(user.role);

  const { data: misRestaurantesRespuesta, isLoading } = useQuery({
    queryKey: ['mis-restaurantes'],
    queryFn: async () => {
      const res = await restauranteService.getMisRestaurantes();
      return res.data;
    },
    enabled: !!isAdmin,
    staleTime: 10 * 60 * 1000,
  });

  const misRestaurantes: Restaurante[] = misRestaurantesRespuesta || [];
  const STORAGE_KEY = "tablebit.active_restaurant_id";

  const [selectedRestauranteId, setSelectedRestauranteIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return Number(stored);
    return null;
  });

  const setSelectedRestauranteId = useCallback((id: number) => {
    setSelectedRestauranteIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
    queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-proximas-reservas'] });
    queryClient.invalidateQueries({ queryKey: ['reservas-admin'] });
    queryClient.invalidateQueries({ queryKey: ['mesas'] });
    queryClient.invalidateQueries({ queryKey: ['calendario'] });
    queryClient.invalidateQueries({ queryKey: ['imagenes'] });
  }, [queryClient]);

  useEffect(() => {
    if (misRestaurantes.length === 0) return;
    const exists = misRestaurantes.some((r) => r.id === selectedRestauranteId);
    if (!exists) {
      const fallback = misRestaurantes[0]?.id || null;
      if (fallback) setSelectedRestauranteId(fallback);
      else setSelectedRestauranteIdState(null);
    }
  }, [misRestaurantes]);

  const restauranteActual = misRestaurantes.find((r) => r.id === selectedRestauranteId) || null;

  return (
    <RestauranteContext.Provider value={{
      selectedRestauranteId,
      setSelectedRestauranteId,
      misRestaurantes,
      restauranteActual,
      isLoading,
    }}>
      {children}
    </RestauranteContext.Provider>
  );
};

export const useRestaurante = () => {
  const context = useContext(RestauranteContext);
  if (!context) throw new Error("useRestaurante must be used within RestauranteProvider");
  return context;
};
