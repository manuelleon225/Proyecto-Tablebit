import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export function useObservabilityHub() {
  return useQuery({
    queryKey: ['observability-snapshot'],
    queryFn: async () => {
      const res = await api.get("/admin/observability/snapshot");
      return res.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
