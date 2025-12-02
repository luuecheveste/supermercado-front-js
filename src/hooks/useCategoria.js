import { useQuery } from "@tanstack/react-query";
import {
  getCategorias,
  searchCategoriasByName,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from "../services/api";

function useCategoria() {
  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const categorias = data?.data ?? [];

  const createCategoriaFn = async (categoriaData) => {
    try {
      const res = await createCategoria(categoriaData);
      alert("Categoría creada correctamente");
      return res.data.data;
    } catch (err) {
      console.error("Error al crear la categoría:", err);
      alert("Error al crear la categoría");
      throw err;
    }
  };

  const updateCategoriaFn = async (id, categoriaData) => {
    try {
      const res = await updateCategoria(id, categoriaData);
      alert("Categoría actualizada correctamente");
      return res.data; // corregido: el backend no devuelve `data`
    } catch (err) {
      console.error("Error al actualizar la categoría:", err);
      alert("Error al actualizar la categoría");
      throw err;
    }
  };

  const deleteCategoriaFn = async (id) => {
    try {
      const res = await deleteCategoria(id);
      alert("Categoría eliminada correctamente");
      return res.data; // corregido: el backend no devuelve `data`
    } catch (err) {
      console.error("Error al eliminar la categoría:", err);
      alert("Error al eliminar la categoría");
      throw err;
    }
  };

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
    createCategoria: createCategoriaFn,
    updateCategoria: updateCategoriaFn,
    deleteCategoria: deleteCategoriaFn,
    searchCategoriasByName: searchCategoriasByNameFn,
  };
}

export default useCategoria;
