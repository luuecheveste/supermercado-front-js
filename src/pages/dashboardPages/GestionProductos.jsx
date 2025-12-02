import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useProducts from "../../hooks/useProducts";
import useCategoria from "../../hooks/useCategoria";
import "./GestionProductos.css";

const Gestion_productos = () => {
  const { products, isLoading, isError, updateProduct, refetchProducts, searchProductsByName } = useProducts();
  const { categorias, isLoading: isLoadingCategorias } = useCategoria();

  const { register, watch } = useForm();
  const [editStock, setEditStock] = useState({});
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit } } = useForm();

  const searchTerm = watch("searchTerm");

  // Filtro por búsqueda
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm || !searchTerm.trim()) {
        setDisplayedProducts(products || []);
        return;
      }

      try {
        const result = await searchProductsByName(searchTerm);
        setDisplayedProducts(result || []);
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setDisplayedProducts([]);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProductsByName, products]);

  // Actualiza productos cuando cambian
  useEffect(() => {
    setDisplayedProducts(products || []);
  }, [products]);

  // Cambiar stock
  const handleStockChange = (id, value) => {
    const stockValue = Math.max(0, Number(value));
    setEditStock((prev) => ({ ...prev, [id]: stockValue }));
  };

  const handleSaveStock = async (id) => {
    const newStock = editStock[id];
    if (newStock !== undefined && !isNaN(newStock)) {
      try {
        await updateProduct({ Productid: id, param: { stock: Number(newStock) } });
        alert("Stock actualizado correctamente");
        refetchProducts();
      } catch (error) {
        console.error("Error completo:", error);
        alert("Error al actualizar el stock");
      }
    }
  };

  const handleToggleEstado = async (id, currentEstado) => {
    try {
      const nuevoEstado = !currentEstado;
      await updateProduct({ Productid: id, param: { estado: nuevoEstado } });
      refetchProducts();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar el estado del producto");
    }
  };

  const openEditModal = (producto) => {
    setEditingProduct(producto);
    resetEdit({
      name: producto.name,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoriaId: producto.categoria?.id || ""
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
    resetEdit();
  };

  const onEditSubmit = async (data) => {
    if (!editingProduct) return;

    try {
      setIsProcessingUpdate(true);
      await updateProduct({
        Productid: editingProduct.id,
        param: {
          name: data.name,
          descripcion: data.descripcion,
          precio: parseFloat(data.precio),
          categoria: data.categoriaId
        }
      });
      refetchProducts();
      closeEditModal();
      alert('Producto actualizado exitosamente!');
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      alert("Error al actualizar el producto");
    } finally {
      setIsProcessingUpdate(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando productos...</div>;
  if (isError) return <div className="error">Error al cargar los productos</div>;

  return (
    <div className="stock-container">
      <h1>Gestión de Productos</h1>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar productos por nombre..."
          {...register("searchTerm")}
          className="search-input"
        />
      </div>

      {/* Tabla de productos */}
      <div className="stock-table-container">
        {displayedProducts && displayedProducts.length > 0 ? (
          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Guardar Stock</th>
                <th>Alta / Baja</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((producto, index) => (
                <tr
                  key={producto.id}
                  className={producto.estado ? "activo" : "inactivo"}
                >
                  {/* ID consecutivo visual */}
                  <td>#{index + 1}</td>
                  <td>{producto.name}</td>
                  <td>{producto.categoria?.name || "Sin categoría"}</td>
                  <td>${producto.precio?.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={editStock[producto.id] ?? producto.stock}
                      onChange={(e) =>
                        handleStockChange(producto.id, e.target.value)
                      }
                      className="stock-input"
                      disabled={!producto.estado}
                    />
                  </td>
                  <td>
                    {producto.estado ? (
                      <span className="estado-activo">Activo</span>
                    ) : (
                      <span className="estado-inactivo">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleSaveStock(producto.id)}
                      disabled={!producto.estado}
                      className={!producto.estado ? "btn-disabled" : ""}
                    >
                      Guardar
                    </button>
                  </td>
                  <td>
                    <div className="role-checkbox">
                      <input
                        type="checkbox"
                        id={`estado-switch-${producto.id}`}
                        checked={producto.estado}
                        onChange={() =>
                          handleToggleEstado(producto.id, producto.estado)
                        }
                      />
                      <label htmlFor={`estado-switch-${producto.id}`}></label>
                      <span>{producto.estado ? "Alta" : "Baja"}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="product-edit"
                      onClick={() => openEditModal(producto)}
                      title="Editar producto"
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-productos">
            {searchTerm && searchTerm.trim()
              ? "No se encontraron productos con ese nombre"
              : "No hay productos registrados"
            }
          </p>
        )}
      </div>

      {/* Modal de edición */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Producto</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="form-producto">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    {...registerEdit("name", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" }
                    })}
                  />
                  {errorsEdit?.name && <p className="error-message">{errorsEdit.name.message}</p>}
                </div>

                <div className="form-group">
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...registerEdit("precio", {
                      required: "El precio es obligatorio",
                      min: { value: 0, message: "El precio debe ser mayor o igual a 0" }
                    })}
                  />
                  {errorsEdit?.precio && <p className="error-message">{errorsEdit.precio.message}</p>}
                </div>

                <div className="form-group">
                  <label>Categoría:</label>
                  <select
                    {...registerEdit("categoriaId", {
                      required: "La categoría es obligatoria"
                    })}
                    className="category-select"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias?.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </option>
                    ))}
                  </select>
                  {errorsEdit?.categoriaId && <p className="error-message">{errorsEdit.categoriaId.message}</p>}
                </div>
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  rows="3"
                  {...registerEdit("descripcion", {
                    required: "La descripción es obligatoria",
                    minLength: { value: 5, message: "La descripción debe tener al menos 5 caracteres" }
                  })}
                />
                {errorsEdit?.descripcion && <p className="error-message">{errorsEdit.descripcion.message}</p>}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeEditModal}>Cancelar</button>
                <button type="submit" disabled={isProcessingUpdate || isSubmittingEdit || isLoadingCategorias}>
                  {isProcessingUpdate ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gestion_productos;
