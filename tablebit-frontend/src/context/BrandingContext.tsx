import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { RestauranteContext } from "@/context/RestauranteContext";
import { DEFAULT_BRANDING, getRestaurantBranding, type BrandingConfig } from "@/lib/branding";
import { applyBrandingToCssVars, resetBranding } from "@/lib/theme";

interface BrandingContextType {
  branding: BrandingConfig;
  setBranding: (b: Partial<BrandingConfig>) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: React.ReactNode }) => {
  const restCtx = useContext(RestauranteContext);
  const restauranteActual = restCtx?.restauranteActual ?? null;

  const [branding, setBrandingState] = useState<BrandingConfig>(() =>
    getRestaurantBranding(restauranteActual)
  );

  useEffect(() => {
    const computed = getRestaurantBranding(restauranteActual);
    setBrandingState(computed);
  }, [restauranteActual?.id, restauranteActual?.branding?.primary_color, restauranteActual?.branding?.secondary_color, restauranteActual?.branding?.accent_color]);

  useEffect(() => {
    applyBrandingToCssVars(branding);
    return () => resetBranding();
  }, [branding]);

  const setBranding = useCallback((partial: Partial<BrandingConfig>) => {
    setBrandingState((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, setBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) throw new Error("useBranding must be used within BrandingProvider");
  return context;
};
