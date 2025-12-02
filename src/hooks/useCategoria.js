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

  // Query para obtener categorías
  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const categorias = data ?? [];

  // Mutation para crear
  const createCategoriaMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría creada correctamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al crear la categoría");
    },
  });

  // Mutation para actualizar
  const updateCategoriaMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría actualizada correctamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al actualizar la categoría");
    },
  });

  // Mutation para eliminar
  const deleteCategoriaMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
      alert("Categoría eliminada correctamente");
    },
    onError: (err) => {
      console.error(err);
      alert("Error al eliminar la categoría");
    },
  });

  // Función para buscar categorías por nombre
  const searchCategoriasByNameFn = async (term) => {
    if (!term) return [];
    try {
      const res = await searchCategoriasByName(term);
      return res ?? [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return {
    categorias,
    isError,
    error,
    isLoading,
    refetchCategorias: refetch,
    createCategoria: createCategoriaMutation.mutateAsync,
    createLoading: createCategoriaMutation.isLoading,
    updateCategoria: updateCategoriaMutation.mutateAsync,
    updateLoading: updateCategoriaMutation.isLoading,
    deleteCategoria: deleteCategoriaMutation.mutateAsync,
    deleteLoading: deleteCategoriaMutation.isLoading,
    searchCategoriasByName: searchCategoriasByNameFn,
  };
}

export default useCategoria;
