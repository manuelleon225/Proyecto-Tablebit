import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Wifi, WifiOff, RefreshCw } from "lucide-react";

const OfflineBanner = () => {
  const { isOnline, connectionRestored } = useOfflineStatus();
  const { showInstall, install, dismiss } = usePWAInstall();

  return (
    <>
      {!isOnline && !connectionRestored && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive/90 text-destructive-foreground text-center text-xs py-1.5 animate-fade-in flex items-center justify-center gap-1.5">
          <WifiOff className="h-3 w-3" />
          <span>Sin conexión — Mostrando datos almacenados</span>
        </div>
      )}
      {connectionRestored && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-success/90 text-success-foreground text-center text-xs py-1.5 animate-fade-in flex items-center justify-center gap-1.5">
          <Wifi className="h-3 w-3" />
          <span>Conexión restaurada. Sincronizando datos...</span>
          <RefreshCw className="h-3 w-3 animate-spin" />
        </div>
      )}
      {showInstall && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-sm mx-auto animate-slide-up">
          <div className="rounded-xl bg-card border border-border/50 shadow-elevated p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">TB</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Instala TableBit</p>
              <p className="text-xs text-muted-foreground">Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <button onClick={install} className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0">
              <Download className="h-3.5 w-3.5 mr-1 inline" /> Instalar
            </button>
            <button onClick={dismiss} className="h-8 w-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center shrink-0" aria-label="Cerrar">
              <span className="text-muted-foreground text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineBanner;
