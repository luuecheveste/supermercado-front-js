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
    queryFn: getCategorias, // ya devuelve los datos directamente
  });

  const createCategoriaFn = useMutation(createCategoria, {
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
    },
  });

  const updateCategoriaFn = useMutation(
    ({ id, data }) => updateCategoria(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categorias"]);
      },
    }
  );

  const deleteCategoriaFn = useMutation(deleteCategoria, {
    onSuccess: () => {
      queryClient.invalidateQueries(["categorias"]);
    },
  });

  return {
    categorias: data || [],
    isError,
    error,
    isLoading,
    refetchCategorias: refetch,
    createCategoria: createCategoriaFn.mutateAsync,
    updateCategoria: updateCategoriaFn.mutateAsync,
    deleteCategoria: deleteCategoriaFn.mutateAsync,
    searchCategoriasByName,
  };
}

export default useCategoria;
