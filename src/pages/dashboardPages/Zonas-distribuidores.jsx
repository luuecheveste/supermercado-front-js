import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useZonas from "../../hooks/useZonas";
import useDistribuidores from "../../hooks/useDistribuidores";
import "./Zonas-distribuidores.css";

const ZonasDistribuidores = () => {
  const {
    zonas,
    isLoading,
    createZona,
    updateZona,
    deleteZona,
    searchZonasByName,
    refetch: refetchZonas,
  } = useZonas();

  const { createDistribuidor, updateDistribuidor, deleteDistribuidor } = useDistribuidores();

  const [displayedZonas, setDisplayedZonas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [editingDistribuidor, setEditingDistribuidor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, reset } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  useEffect(() => {
    setDisplayedZonas(zonas || []);
  }, [zonas]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setDisplayedZonas(zonas);
      return;
    }

    try {
      const result = await searchZonasByName(term);
      setDisplayedZonas(result);
    } catch {
      setDisplayedZonas([]);
    }
  };

  const handleRefetch = () => {
    setSearchTerm("");
    refetchZonas();
  };

  const onSubmit = async (data) => {
    try {
      setIsProcessing(true);
      const zonaCreada = await createZona({
        name: data.zonaName,
        description: data.zonaDescription,
      });

      await createDistribuidor({
        name: data.distribuidorName,
        apellido: data.distribuidorApellido,
        dni: data.distribuidorDni,
        valorEntrega: parseFloat(data.distribuidorValorEntrega),
        zona: zonaCreada.data.id,
      });

      alert("Zona y distribuidor creados correctamente");
      handleRefetch();
      reset();
    } catch (err) {
      console.error(err);
      alert("Error al crear zona y distribuidor");
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = (zona) => {
    setEditingZona(zona);
    const distribuidor = zona.distribuidores?.[0] || null;
    setEditingDistribuidor(distribuidor);

    resetEdit({
      zonaName: zona.name,
      zonaDescription: zona.description,
      distribuidorName: distribuidor?.name || "",
      distribuidorApellido: distribuidor?.apellido || "",
      distribuidorDni: distribuidor?.dni || "",
      distribuidorValorEntrega: distribuidor?.valorEntrega || 0,
    });

    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingZona(null);
    setEditingDistribuidor(null);
    resetEdit();
  };

  const onEditSubmit = async (data) => {
    if (!editingZona) return;
    try {
      setIsProcessing(true);
      await updateZona(editingZona.id, {
        name: data.zonaName,
        description: data.zonaDescription,
      });

      if (editingDistribuidor) {
        await updateDistribuidor(editingDistribuidor.id, {
          name: data.distribuidorName,
          apellido: data.distribuidorApellido,
          dni: data.distribuidorDni,
          valorEntrega: parseFloat(data.distribuidorValorEntrega),
          zona: editingZona.id,
        });
      }

      alert("Zona y distribuidor actualizados correctamente");
      handleRefetch();
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar zona y distribuidor");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (zonaId, distribuidorId) => {
    if (!window.confirm("¿Eliminar zona y distribuidor asociado?")) return;

    try {
      setIsProcessing(true);
      await deleteZona(zonaId);
      if (distribuidorId) await deleteDistribuidor(distribuidorId);
      alert("Zona y distribuidor eliminados correctamente");
      handleRefetch();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar zona o distribuidor");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDistribuidorByZona = (zona) => zona.distribuidores?.[0] || null;

  if (isLoading) return <p className="loading-message">Cargando zonas...</p>;

  return (
    <div className="zonas-distribuidores-container">
      <h1>Gestión de Zonas y Distribuidores</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar zonas..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="zonas-list">
        {displayedZonas.length > 0 ? (
          displayedZonas.map((zona) => {
            const distribuidor = getDistribuidorByZona(zona);
            return (
              <div key={zona.id} className="zona-card">
                <div className="zona-actions">
                  <button
                    className="zona-delete"
                    onClick={() => handleDelete(zona.id, distribuidor?.id)}
                    disabled={isProcessing}
                  >
                    ✖
                  </button>
                  <button className="zona-edit" onClick={() => openEditModal(zona)}>✎</button>
                </div>

                <div className="zona-info">
                  <div><strong>Zona:</strong> {zona.name}</div>
                  <div><strong>Descripción:</strong> {zona.description}</div>
                </div>

                {distribuidor ? (
                  <div className="distribuidor-info">
                    <div><strong>Distribuidor:</strong> {distribuidor.name} {distribuidor.apellido}</div>
                    <div><strong>DNI:</strong> {distribuidor.dni}</div>
                    <div><strong>Valor Entrega:</strong> ${distribuidor.valorEntrega}</div>
                  </div>
                ) : (
                  <div className="distribuidor-info empty">No hay distribuidor asociado</div>
                )}
              </div>
            );
          })
        ) : (
          <p className="empty-state">{searchTerm ? "No se encontraron zonas" : "No hay zonas creadas"}</p>
        )}
      </div>

      {/* Modal de edición */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Zona y Distribuidor</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="form-zona-distribuidor">
              <div className="form-section">
                <h4>Zona</h4>
                <input type="text" {...registerEdit("zonaName", { required: true })} placeholder="Nombre de la zona" />
                <input type="text" {...registerEdit("zonaDescription", { required: true })} placeholder="Descripción" />
              </div>

              <div className="form-section">
                <h4>Distribuidor</h4>
                <input type="text" {...registerEdit("distribuidorName", { required: true })} placeholder="Nombre" />
                <input type="text" {...registerEdit("distribuidorApellido", { required: true })} placeholder="Apellido" />
                <input type="text" {...registerEdit("distribuidorDni", { required: true })} placeholder="DNI" />
                <input type="number" step="0.01" min="0" {...registerEdit("distribuidorValorEntrega", { required: true })} placeholder="Valor de entrega" />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeEditModal}>Cancelar</button>
                <button type="submit" disabled={isProcessing}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crear nueva zona */}
      <div className="nueva-zona-distribuidor">
        <h2>Crear Nueva Zona con Distribuidor</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form-zona-distribuidor">
          <div className="form-section">
            <h4>Zona</h4>
            <input type="text" {...register("zonaName", { required: true })} placeholder="Nombre de la zona" />
            <input type="text" {...register("zonaDescription", { required: true })} placeholder="Descripción" />
          </div>

          <div className="form-section">
            <h4>Distribuidor</h4>
            <input type="text" {...register("distribuidorName", { required: true })} placeholder="Nombre" />
            <input type="text" {...register("distribuidorApellido", { required: true })} placeholder="Apellido" />
            <input type="text" {...register("distribuidorDni", { required: true })} placeholder="DNI" />
            <input type="number" step="0.01" min="0" {...register("distribuidorValorEntrega", { required: true })} placeholder="Valor de entrega" />
          </div>

          <button type="submit" disabled={isProcessing}>
            {isProcessing ? "Procesando..." : "Crear Zona y Distribuidor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZonasDistribuidores;
