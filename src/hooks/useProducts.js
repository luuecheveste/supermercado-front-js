import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
  searchProductsByName,
  searchProductsByCategoria,
  getTotalStock,
  updateProduct,
  createProduct,
  uploadImage
} from "../services/api";

function useProducts() {

  // ------- Productos -------
  const {
    data: productsData,
    isError,
    error,
    isLoading,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // backend = { message, data: [...] }
  const products = productsData?.data ?? [];


  // ------- Stock Total -------
  const {
    data: totalStockData,
    isError: isStockError,
    error: stockError,
    isLoading: isStockLoading,
    refetch: refetchStock
  } = useQuery({
    queryKey: ["totalStock"],
    queryFn: getTotalStock,
  });
  const totalStock = totalStockData?.data?.stocktotal ?? 0;
  
  // ------- Mutaciones -------
  const updateProductFn = async ({ Productid, param }) => {
    if (!Productid || isNaN(Number(Productid))) throw new Error("ID inválido");
    return updateProduct(Number(Productid), param);
  };

  const createProductFn = async (producto) => createProduct(producto);

  const uploadImageFn = async (id, imageFile) => {
    if (!id || isNaN(Number(id))) throw new Error("ID inválido");
    return uploadImage(Number(id), imageFile);
  };


  // ------- Búsquedas -------
  const safeSearchByName = async (term) => {
    if (!term) return [];
    const response = await searchProductsByName(term);
    return response?.data ?? [];
  };

  const safeSearchByCategoria = async (categoriaId) => {
    if (!categoriaId) return [];
    const response = await searchProductsByCategoria(Number(categoriaId));
    return response?.data ?? [];
  };


  return {
    products,
    totalStock,
    isError,
    error,
    isLoading,
    isStockError,
    stockError,
    isStockLoading,
    refetchProducts,
    refetchStock,
    createProduct: createProductFn,
    updateProduct: updateProductFn,
    uploadImage: uploadImageFn,
    searchProductsByName: safeSearchByName,
    searchProductsByCategoria: safeSearchByCategoria,
  };
}

export default useProducts;
