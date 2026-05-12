import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 text-center">
      <div className="space-y-4">
        <h1 className="font-display text-8xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Página no encontrada</p>
        <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
          La página que buscas no existe o fue movida.
        </p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
