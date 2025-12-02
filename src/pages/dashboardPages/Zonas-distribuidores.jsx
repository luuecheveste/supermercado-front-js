import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useZonas from '../../hooks/useZonas';
import useDistribuidor from '../../hooks/useDistribuidor';
import './Zonas-distribuidores.css';

const ZonaDistribuidor = () => {
  const { createZona, deleteZona, zonas, isLoading, refetchZonas, updateZona, searchZonasByName } = useZonas();
  const { createDistribuidor, deleteDistribuidor, updateDistribuidor } = useDistribuidor();

  const { register, handleSubmit, reset } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [editingDistribuidor, setEditingDistribuidor] = useState(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedZonas, setDisplayedZonas] = useState([]);

  useEffect(() => {
    setDisplayedZonas(zonas || []);
  }, [zonas]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setDisplayedZonas(zonas || []);
    } else {
      try {
        const result = await searchZonasByName(term);
        setDisplayedZonas(result || []);
      } catch {
        setDisplayedZonas([]);
      }
    }
  };

  const handleRefetchZonas = async () => {
    await refetchZonas();
    setDisplayedZonas(zonas || []);
  };

  const onSubmit = async (data) => {
    try {
      const zonaData = { name: data.zonaName, description: data.zonaDescription };
      const zonaCreada = await createZona(zonaData);

      const distribuidorData = {
        name: data.distribuidorName,
        apellido: data.distribuidorApellido,
        dni: data.distribuidorDni,
        valorEntrega: parseFloat(data.distribuidorValorEntrega),
        zona: zonaCreada.data.id
      };

      await createDistribuidor(distribuidorData);
      await handleRefetchZonas();

      alert('Zona y distribuidor creados correctamente!');
      reset();
    } catch (err) {
      console.error(err);
      alert('Error al crear zona y distribuidor');
    }
  };

  const handleDelete = async (zonaId, distribuidorId) => {
    if (!window.confirm("¿Eliminar esta zona y su distribuidor asociado?")) return;
    try {
      setIsProcessingDelete(true);
      await deleteZona(zonaId);
      if (distribuidorId) await deleteDistribuidor(distribuidorId);

      await handleRefetchZonas();
      alert('Zona y distribuidor eliminados correctamente!');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar zona y distribuidor');
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const openEditModal = (zona) => {
    setEditingZona(zona);
    const distribuidorAsociado = zona.distribuidores?.[0] || null;
    setEditingDistribuidor(distribuidorAsociado);

    resetEdit({
      zonaName: zona.name,
      zonaDescription: zona.description,
      distribuidorName: distribuidorAsociado?.name || '',
      distribuidorApellido: distribuidorAsociado?.apellido || '',
      distribuidorDni: distribuidorAsociado?.dni || '',
      distribuidorValorEntrega: distribuidorAsociado?.valorEntrega || 0
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
      setIsProcessingUpdate(true);

      await updateZona(editingZona.id, {
        name: data.zonaName,
        description: data.zonaDescription
      });

      if (editingDistribuidor) {
        await updateDistribuidor(editingDistribuidor.id, {
          name: data.distribuidorName,
          apellido: data.distribuidorApellido,
          dni: data.distribuidorDni,
          valorEntrega: parseFloat(data.distribuidorValorEntrega),
          zona: editingZona.id
        });
      }

      await handleRefetchZonas();
      alert('Zona y distribuidor actualizados correctamente!');
      closeEditModal();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar zona y distribuidor');
    } finally {
      setIsProcessingUpdate(false);
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
          placeholder="Buscar zonas por nombre..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="zonas-list">
        <h2>Zonas y Distribuidores Existentes</h2>
        {displayedZonas?.length > 0 ? (
          displayedZonas.map((zona) => {
            const distribuidor = getDistribuidorByZona(zona);
            return (
              <div key={zona.id} className="zona-card">
                <div className="zona-actions">
                  <button className="zona-delete" onClick={() => handleDelete(zona.id, distribuidor?.id)} disabled={isProcessingDelete}>✖</button>
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
                    <div><strong>Valor de Entrega:</strong> ${distribuidor.valorEntrega}</div>
                  </div>
                ) : (
                  <div className="distribuidor-info empty"><em>No hay distribuidor asociado</em></div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            {searchTerm ? "No se encontraron zonas con ese nombre" : "No hay zonas creadas."}
          </div>
        )}
      </div>

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Zona y Distribuidor</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="form-zona-distribuidor">
              <div className="form-section">
                <h4>Datos de la Zona</h4>
                <input type="text" placeholder="Nombre de la zona" {...registerEdit("zonaName", { required: true })} />
                <input type="text" placeholder="Descripción de la zona" {...registerEdit("zonaDescription", { required: true })} />
              </div>

              <div className="form-section">
                <h4>Datos del Distribuidor</h4>
                <input type="text" placeholder="Nombre" {...registerEdit("distribuidorName", { required: true })} />
                <input type="text" placeholder="Apellido" {...registerEdit("distribuidorApellido", { required: true })} />
                <input type="text" placeholder="DNI" {...registerEdit("distribuidorDni", { required: true })} />
                <input type="number" step="0.01" min="0" placeholder="Valor de entrega" {...registerEdit("distribuidorValorEntrega", { required: true })} />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeEditModal}>Cancelar</button>
                <button type="submit" disabled={isProcessingUpdate}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="nueva-zona-distribuidor">
        <h2>Crear Nueva Zona con Distribuidor</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-section">
            <h3>Datos de la Zona</h3>
            <input {...register("zonaName", { required: true })} type="text" placeholder="Nombre de la zona" />
            <input {...register("zonaDescription", { required: true })} type="text" placeholder="Descripción" />
          </div>

          <div className="form-section">
            <h3>Datos del Distribuidor</h3>
            <input {...register("distribuidorName", { required: true })} type="text" placeholder="Nombre" />
            <input {...register("distribuidorApellido", { required: true })} type="text" placeholder="Apellido" />
            <input {...register("distribuidorDni", { required: true })} type="text" placeholder="DNI" />
            <input {...register("distribuidorValorEntrega", { required: true })} type="number" step="0.01" min="0" placeholder="Valor de entrega" />
          </div>

          <button type="submit">
            Crear Zona y Distribuidor
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZonaDistribuidor;
