import { useQuery } from "@tanstack/react-query";
import {
  getDistribuidoresByZona,
  createDistribuidor,
  updateDistribuidor,
  deleteDistribuidor
} from "../services/api";

/**
 * Hook para manejar distribuidores asociados a una zona específica.
 * @param {number|string} zonaId - ID de la zona a la que pertenecen los distribuidores.
 */
function useDistribuidores(zonaId) {
  if (!zonaId) throw new Error("useDistribuidores requiere un zonaId válido");

  // ------- Distribuidores -------
  const {
    data: distribuidoresData,
    isError,
    error,
    isLoading,
    refetch: refetchDistribuidores
  } = useQuery({
    queryKey: ["distribuidores", zonaId],
    queryFn: () => getDistribuidoresByZona(Number(zonaId)),
  });

  const distribuidores = Array.isArray(distribuidoresData?.data)
    ? distribuidoresData.data
    : [];

  // ------- Mutaciones -------
  const createDistribuidorFn = async (distribuidor) => {
    if (!zonaId) throw new Error("No se puede crear distribuidor sin zonaId");
    return createDistribuidor({ ...distribuidor, zona: Number(zonaId) });
  };

  const updateDistribuidorFn = async (id, distribuidor) => {
    if (!id) throw new Error("ID de distribuidor inválido");
    return updateDistribuidor(Number(id), { ...distribuidor, zona: Number(zonaId) });
  };

  const deleteDistribuidorFn = async (id) => {
    if (!id) throw new Error("ID de distribuidor inválido");
    return deleteDistribuidor(Number(id));
  };

  // ------- Búsqueda segura (opcional) -------
  const safeSearchDistribuidores = async (term) => {
    if (!term?.trim()) return [];
    const data = await getDistribuidoresByZona(zonaId);
    return Array.isArray(data?.data)
      ? data.data.filter(d => d.name.toLowerCase().includes(term.toLowerCase()))
      : [];
  };

  return {
    distribuidores,
    isError,
    error,
    isLoading,
    refetchDistribuidores,
    createDistribuidor: createDistribuidorFn,
    updateDistribuidor: updateDistribuidorFn,
    deleteDistribuidor: deleteDistribuidorFn,
    searchDistribuidores: safeSearchDistribuidores,
  };
}

export default useDistribuidores;
