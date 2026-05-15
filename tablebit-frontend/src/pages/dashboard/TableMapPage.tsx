import DashboardLayout from "@/layouts/DashboardLayout";
import { TableMap } from "@/components/mesas/TableMap";
import { useSEO } from "@/hooks/useSEO";
import { useRestaurante } from "@/context/RestauranteContext";

const TableMapPage = () => {
  const { restauranteActual } = useRestaurante();

  useSEO({ title: "TableBit - Mapa de mesas", description: "Gestiona visualmente la disposición de las mesas." });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Mapa de mesas</h1>
          <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Gestiona la disposición de tu salón"}</p>
        </div>
        <TableMap />
      </div>
    </DashboardLayout>
  );
};

export default TableMapPage;
