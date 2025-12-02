import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategorias,
  searchCategoriasByName,
  createCategoria as apiCreateCategoria,
  updateCategoria as apiUpdateCategoria,
  deleteCategoria as apiDeleteCategoria
} from "../services/api";

function useCategoria() {
  const queryClient = useQueryClient();

  // Trae todas las categorías
  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const categorias = data?.data ?? []; // <-- el array real de categorías

  // Crear categoría
  const createCategoria = async (categoriaData) => {
    const res = await apiCreateCategoria(categoriaData);
    queryClient.invalidateQueries(["categorias"]);
    return res.data?.data ?? res.data; // evita usar data.data.data
  };

  // Actualizar categoría
  const updateCategoria = async (id, categoriaData) => {
    const res = await apiUpdateCategoria(id, categoriaData);
    queryClient.invalidateQueries(["categorias"]);
    return res.data?.data ?? res.data;
  };

  // Eliminar categoría
  const deleteCategoria = async (id) => {
    const res = await apiDeleteCategoria(id);
    queryClient.invalidateQueries(["categorias"]);
    return res.data?.data ?? res.data;
  };

  // Buscar categorías por nombre
  const searchCategoriasByNameFn = async (term) => {
    if (!term) return [];
    const res = await searchCategoriasByName(term);
    return res.data?.data ?? [];
  };

  return {
    categorias,
    isError,
    error,
    isLoading,
    refetchCategorias: refetch,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    searchCategoriasByName: searchCategoriasByNameFn,
  };
}

export default useCategoria;
