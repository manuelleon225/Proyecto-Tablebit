import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import { useAuth } from "@/context/AuthContext";

interface RestauranteContextType {
  selectedRestauranteId: number | null;
  setSelectedRestauranteId: (id: number) => void;
  misRestaurantes: { id: number; nombre: string }[];
  restauranteActual: { id: number; nombre: string } | null;
  isLoading: boolean;
}

const RestauranteContext = createContext<RestauranteContextType | undefined>(undefined);

export const RestauranteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

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

  const misRestaurantes: { id: number; nombre: string }[] = misRestaurantesRespuesta || [];

  const [selectedRestauranteId, setSelectedRestauranteIdState] = useState<number | null>(null);

  const setSelectedRestauranteId = useCallback((id: number) => {
    setSelectedRestauranteIdState(id);
    localStorage.setItem("tablebit_restaurante_id", String(id));
  }, []);

  useEffect(() => {
    if (!selectedRestauranteId && misRestaurantes.length > 0) {
      setSelectedRestauranteId(misRestaurantes[0].id);
    }
  }, [misRestaurantes, selectedRestauranteId, setSelectedRestauranteId]);

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
