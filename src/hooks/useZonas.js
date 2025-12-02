import { useQuery } from "@tanstack/react-query";
import {
  getZonas,
  searchZonasByName,
  createZona,
  updateZona,
  deleteZona
} from "../services/api";

function useZonas() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["zonas"],
    queryFn: getZonas
  });

  const zonas = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const createZonaFn = async (zona) => createZona(zona);
  const updateZonaFn = async (id, zona) => {
    if (!id) throw new Error("ID inválido");
    return updateZona(id, zona);
  };
  const deleteZonaFn = async (id) => deleteZona(id);

  const searchZonasFn = async (term) => {
    if (!term) return [];
    const res = await searchZonasByName(term);
    return Array.isArray(res) ? res : [];
  };

  return {
    zonas,
    isLoading,
    isError,
    error,
    refetch,
    createZona: createZonaFn,
    updateZona: updateZonaFn,
    deleteZona: deleteZonaFn,
    searchZonasByName: searchZonasFn,
  };
}

export default useZonas;
