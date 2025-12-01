// src/services/api.js
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error("Variable VITE_API_URL no definida");

// ---------------------- CLIENTES ----------------------
export const updateClient = async (id, clientData) =>
  (await axios.patch(`${API_URL}/api/cliente/${id}`, clientData)).data;

export const searchClientesByName = async (param) => {
  const res = await axios.get(`${API_URL}/api/cliente/search?q=${param}`);
  return res.data.data; // backend devuelve {data: []}
};

export const getClientesCount = async () =>
  (await axios.get(`${API_URL}/api/cliente/count`)).data;


// ---------------------- CATEGORÍAS ----------------------
export const getCategorias = async () => {
  const res = await axios.get(`${API_URL}/api/categoria`);
  return res.data.data;
};

export const createCategoria = async (data) =>
  (await axios.post(`${API_URL}/api/categoria`, data)).data;

export const updateCategoria = async (id, data) =>
  (await axios.patch(`${API_URL}/api/categoria/${id}`, data)).data;

export const deleteCategoria = async (id) =>
  (await axios.delete(`${API_URL}/api/categoria/${id}`)).data;

export const searchCategoriasByName = async (param) => {
  const res = await axios.get(`${API_URL}/api/categoria/search?q=${param}`);
  return res.data.data;
};


// ---------------------- DISTRIBUIDORES ----------------------
export const getDistribuidoresByZona = async (zonaId) => {
  const res = await axios.get(`${API_URL}/api/distribuidor/zona/${zonaId}`);
  return res.data.data;
};

export const createDistribuidor = async (data) =>
  (await axios.post(`${API_URL}/api/distribuidor`, data)).data;

export const updateDistribuidor = async (id, data) =>
  (await axios.patch(`${API_URL}/api/distribuidor/${id}`, data)).data;

export const deleteDistribuidor = async (id) =>
  (await axios.delete(`${API_URL}/api/distribuidor/${id}`)).data;


// ---------------------- MERCADOPAGO ----------------------
export const createPreference = async (data) =>
  (await axios.post(`${API_URL}/api/mercadopago/create-preference`, data)).data;


// ---------------------- PRODUCTOS ----------------------
export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/api/producto`);
  return res.data; // { message, data: [...] }
};

export const searchProductsByName = async (param) => {
  const res = await axios.get(`${API_URL}/api/producto/buscar?q=${param}`);
  return res.data.data;
};

export const searchProductsByCategoria = async (categoriaId) => {
  const res = await axios.get(`${API_URL}/api/producto/categoria?categoriaId=${categoriaId}`);
  return res.data.data;
};

export const updateProduct = async (id, data) =>
  (await axios.patch(`${API_URL}/api/producto/${id}`, data)).data;

export const getTotalStock = async () => {
  const res = await axios.get(`${API_URL}/api/producto/stocktotal`);
  return res.data.stocktotal; 
};

export const createProduct = async (data) =>
  (await axios.post(`${API_URL}/api/producto`, data)).data;

export const uploadImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append("imagen", imageFile);

  const res = await axios.post(
    `${API_URL}/api/producto/${id}/imagen`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};


// ---------------------- VENTAS ----------------------
export const getVentas = async () => {
  const res = await axios.get(`${API_URL}/api/venta`);
  return res.data.data;
};

export const getVentasCount = async () =>
  (await axios.get(`${API_URL}/api/venta/count`)).data;

export const procesarCompra = async (compraData) =>
  (await axios.post(`${API_URL}/api/venta/procesarCompra`, compraData)).data;


// ---------------------- ZONAS ----------------------
export const getZonas = async () => {
  const res = await axios.get(`${API_URL}/api/zona`);
  return res.data.data;
};

export const createZona = async (data) =>
  (await axios.post(`${API_URL}/api/zona`, data)).data;

export const updateZona = async (id, data) =>
  (await axios.patch(`${API_URL}/api/zona/${id}`, data)).data;

export const deleteZona = async (id) =>
  (await axios.delete(`${API_URL}/api/zona/${id}`)).data;

export const searchZonasByName = async (param) => {
  const res = await axios.get(`${API_URL}/api/zona/search?q=${param}`);
  return res.data.data;
};
