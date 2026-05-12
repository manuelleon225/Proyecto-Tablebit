import { useState, useCallback } from "react";
import { handleApiError, type ApiError } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(options?: { showToast?: boolean; successMessage?: string }) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { toast } = useToast();
  const { showToast = true, successMessage } = options || {};

  const execute = useCallback(
    async (asyncFn: () => Promise<{ data: T }>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await asyncFn();
        setState({ data: response.data, loading: false, error: null });
        if (showToast && successMessage) {
          toast({ title: "Éxito", description: successMessage });
        }
        return { data: response.data, error: null };
      } catch (err) {
        const apiError = handleApiError(err);
        setState({ data: null, loading: false, error: apiError.message });
        if (showToast) {
          toast({ variant: "destructive", title: "Error", description: apiError.message });
        }
        return { data: null, error: apiError };
      }
    },
    [showToast, successMessage, toast]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
