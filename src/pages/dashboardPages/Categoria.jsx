import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCategoria from "../../hooks/useCategoria";
import "./Categoria.css";

function NuevaCategoria() {
  const { 
    categorias, 
    isLoading, 
    createCategoria, 
    refetchCategorias, 
    updateCategoria, 
    deleteCategoria, 
    searchCategoriasByName 
  } = useCategoria();

  const { register, handleSubmit, reset, formState:  isSubmitting } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [displayedCategorias, setDisplayedCategorias] = useState([]);

  useEffect(() => {
    setDisplayedCategorias(categorias || []);
  }, [categorias]);

  const handleRefetch = () => {
    setSearchTerm("");
    refetchCategorias?.();
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setDisplayedCategorias(categorias || []);
    } else {
      try {
        const result = await searchCategoriasByName(term);
        setDisplayedCategorias(result || []);
      } catch (error) {
        console.error(error);
        setDisplayedCategorias([]);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      await createCategoria({ name: data.name, description: data.description });
      alert("Categoría creada exitosamente");
      handleRefetch();
      reset();
    } catch (error) {
      console.error(error);
      alert("Error al crear la categoría");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Eliminar esta categoría?");
    if (!ok) return;
    try {
      setIsProcessingDelete(true);
      await deleteCategoria(id);
      alert("Categoría eliminada correctamente");
      handleRefetch();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar categoría");
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    resetEdit({ name: cat.name, description: cat.description });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingCategory(null);
    resetEdit();
  };

  const onEditSubmit = async (data) => {
    if (!editingCategory) return;
    try {
      setIsProcessingUpdate(true);
      await updateCategoria(editingCategory.id, { name: data.name, description: data.description });
      alert("Categoría actualizada correctamente");
      handleRefetch();
      closeEditModal();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar categoría");
    } finally {
      setIsProcessingUpdate(false);
    }
  };

  if (isLoading) return <p>Cargando categorías...</p>;

  return (
    <div className="categorias-container">
      <h2 className="categorias-title">Categorías</h2>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar categorías por nombre..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="categorias-list">
        {displayedCategorias?.map((cat) => (
          <div key={cat.id} className="categoria-card">
            <div className="categoria-actions">
              <button
                className="categoria-delete"
                onClick={() => handleDelete(cat.id)}
                disabled={isProcessingDelete}
                title="Eliminar categoría"
              >
                ✖
              </button>
              <button
                className="categoria-edit"
                onClick={() => openEditModal(cat)}
                title="Editar categoría"
              >
                ✎
              </button>
            </div>
            <div className="categoria-nombre">{cat.name}</div>
            <div className="categoria-descripcion">{cat.description}</div>
          </div>
        ))}
        {searchTerm && displayedCategorias.length === 0 && (
          <p>No se encontraron categorías</p>
        )}
      </div>

      {/* Modal de edición */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar categoría</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="form-categoria">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre"
                  {...registerEdit("name", { required: true, minLength: 2 })}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Descripción"
                  {...registerEdit("description", { minLength: 5 })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeEditModal}>Cancelar</button>
                <button type="submit" disabled={isProcessingUpdate}>
                  {isProcessingUpdate ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form de nueva categoría */}
      <div className="nueva-categoria">
        <h3 className="nueva-categoria-title">Nueva Categoría</h3>
        <form className="form-categoria" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre"
              {...register("name", { required: true, minLength: 2 })}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Descripción"
              {...register("description", { minLength: 5 })}
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NuevaCategoria;
