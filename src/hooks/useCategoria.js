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

  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const categorias = Array.isArray(data) ? data : []; // ya es un array desde el api.js

  const createCategoria = async (categoriaData) => {
    const res = await apiCreateCategoria(categoriaData);
    queryClient.invalidateQueries(["categorias"]);
    return res; // ya devuelve el objeto creado
  };

  const updateCategoria = async (id, categoriaData) => {
    const res = await apiUpdateCategoria(id, categoriaData);
    queryClient.invalidateQueries(["categorias"]);
    return res;
  };

  const deleteCategoria = async (id) => {
    const res = await apiDeleteCategoria(id);
    queryClient.invalidateQueries(["categorias"]);
    return res;
  };

  const searchCategoriasByNameFn = async (term) => {
    if (!term) return [];
    const res = await searchCategoriasByName(term);
    return Array.isArray(res) ? res : [];
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
