import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategorias,
  searchCategoriasByName,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from "../services/api";

function useCategoria() {
  const queryClient = useQueryClient();

  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const categorias = data || [];

  const createCategoriaFn = useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría creada exitosamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al crear la categoría");
    },
  });

  const updateCategoriaFn = useMutation({
    mutationFn: ({ id, data }) => updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría actualizada exitosamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al actualizar la categoría");
    },
  });

  const deleteCategoriaFn = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría eliminada exitosamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al eliminar la categoría");
    },
  });

  const searchCategoriasByNameFn = async (param) => {
    if (!param) return categorias;
    return await searchCategoriasByName(param);
  };

  return {
    categorias,
    isLoading,
    isError,
    error,
    refetchCategorias: refetch,
    createCategoria: createCategoriaFn.mutateAsync,
    updateCategoria: updateCategoriaFn.mutateAsync,
    deleteCategoria: deleteCategoriaFn.mutateAsync,
    searchCategoriasByName: searchCategoriasByNameFn,
  };
}

export default useCategoria;
