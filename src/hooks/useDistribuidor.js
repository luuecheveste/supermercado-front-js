import { useQuery } from "@tanstack/react-query";
import {
  getDistribuidoresByZona,
  createDistribuidor,
  updateDistribuidor,
  deleteDistribuidor
} from "../services/api";

function useDistribuidores(zonaId) {
  if (!zonaId) throw new Error("useDistribuidores requiere un zonaId");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["distribuidores", zonaId],
    queryFn: () => getDistribuidoresByZona(zonaId),
    enabled: Boolean(zonaId)
  });

  const distribuidores = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const createDistribuidorFn = async (distribuidor) => {
    if (!distribuidor.zona) distribuidor.zona = zonaId;
    return createDistribuidor(distribuidor);
  };

  const updateDistribuidorFn = async (id, distribuidor) => {
    if (!id) throw new Error("ID de distribuidor inválido");
    return updateDistribuidor(id, distribuidor);
  };

  const deleteDistribuidorFn = async (id) => {
    if (!id) throw new Error("ID de distribuidor inválido");
    return deleteDistribuidor(id);
  };

  return {
    distribuidores,
    isLoading,
    isError,
    error,
    refetch,
    createDistribuidor: createDistribuidorFn,
    updateDistribuidor: updateDistribuidorFn,
    deleteDistribuidor: deleteDistribuidorFn
  };
}

export default useDistribuidores;
