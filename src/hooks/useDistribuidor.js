import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDistribuidoresByZona,
  createDistribuidor as apiCreateDistribuidor,
  updateDistribuidor as apiUpdateDistribuidor,
  deleteDistribuidor as apiDeleteDistribuidor,
} from "../services/api";

// zonaId es obligatorio para las funciones de query, pero lo hacemos opcional internamente
function useDistribuidor(zonaId) {
  const queryClient = useQueryClient();

  // Solo ejecutamos la query si hay zonaId
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["distribuidores", zonaId],
    queryFn: () => getDistribuidoresByZona(zonaId),
    enabled: !!zonaId,
  });

  const distribuidores = data?.data ?? [];

  // Mutaciones
  const createDistribuidor = useMutation({
    mutationFn: (distribuidor) => apiCreateDistribuidor(distribuidor),
    onSuccess: () => queryClient.invalidateQueries(["distribuidores", zonaId]),
  });

  const updateDistribuidor = useMutation({
    mutationFn: ({ id, data }) => apiUpdateDistribuidor(id, data),
    onSuccess: () => queryClient.invalidateQueries(["distribuidores", zonaId]),
  });

  const deleteDistribuidor = useMutation({
    mutationFn: (id) => apiDeleteDistribuidor(id),
    onSuccess: () => queryClient.invalidateQueries(["distribuidores", zonaId]),
  });

  return {
    distribuidores,
    isLoading,
    isError,
    error,
    refetch,
    createDistribuidor: createDistribuidor.mutateAsync,
    updateDistribuidor: updateDistribuidor.mutateAsync,
    deleteDistribuidor: deleteDistribuidor.mutateAsync,
  };
}

export default useDistribuidor;
