import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useCategoria from "../../hooks/useCategoria";
import "./Categoria.css";

function NuevaCategoria() {
  const {
    categorias,
    isLoading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    refetchCategorias,
    searchCategoriasByName,
  } = useCategoria();

  const { register, handleSubmit, reset } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedCategorias, setDisplayedCategorias] = useState([]);

  useEffect(() => {
    setDisplayedCategorias(categorias || []);
  }, [categorias]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) return setDisplayedCategorias(categorias);

    try {
      const results = await searchCategoriasByName(term);
      setDisplayedCategorias(results || []);
    } catch (err) {
      console.error(err);
      setDisplayedCategorias([]);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createCategoria({ name: data.name, description: data.description });
      alert("Categoría creada exitosamente");
      reset();
      refetchCategorias();
    } catch (err) {
      console.error(err);
      alert("Error al crear categoría");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return alert("ID inválido");
    const ok = window.confirm("¿Eliminar esta categoría?");
    if (!ok) return;

    try {
      await deleteCategoria(id);
      alert("Categoría eliminada exitosamente");
      refetchCategorias();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar categoría");
    }
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    resetEdit({ name: cat.name, description: cat.description });
    setEditModalOpen(true);
  };

  const onEditSubmit = async (data) => {
    if (!editingCategory) return;

    try {
      await updateCategoria(editingCategory.id, { name: data.name, description: data.description });
      alert("Categoría actualizada exitosamente");
      refetchCategorias();
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar categoría");
    }
  };

  if (isLoading) return <p>Cargando categorías...</p>;

  return (
    <div className="categorias-container">
      <h2>Categorías</h2>

      <input
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className="categorias-list">
        {displayedCategorias?.map((cat) => (
          <div key={cat.id} className="categoria-card">
            <div className="categoria-actions">
              <button onClick={() => handleDelete(cat.id)}>✖</button>
              <button onClick={() => openEditModal(cat)}>✎</button>
            </div>
            <div>{cat.name}</div>
            <div>{cat.description}</div>
          </div>
        ))}
        {searchTerm && displayedCategorias.length === 0 && <p>No se encontraron categorías</p>}
      </div>

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar categoría</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)}>
              <input {...registerEdit("name")} placeholder="Nombre" />
              <input {...registerEdit("description")} placeholder="Descripción" />
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <div className="nueva-categoria">
        <h3>Nueva categoría</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("name")} placeholder="Nombre" />
          <input {...register("description")} placeholder="Descripción" />
          <button type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
}

export default NuevaCategoria;
