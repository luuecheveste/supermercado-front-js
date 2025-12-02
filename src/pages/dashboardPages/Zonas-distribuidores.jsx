import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useZonas from "../../hooks/useZonas";
import useDistribuidor from "../../hooks/useDistribuidor";
import "./Zonas-distribuidores.css";

const ZonasDistribuidores = () => {
  const { zonas, isLoading: loadingZonas, createZona, updateZona, deleteZona, searchZonasByName, refetch: refetchZonas } = useZonas();

  const [selectedZonaId, setSelectedZonaId] = useState(null);
  const { createDistribuidor, updateDistribuidor, deleteDistribuidor } = useDistribuidor(selectedZonaId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [editingDistribuidor, setEditingDistribuidor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedZonas, setDisplayedZonas] = useState([]);

  const { register, handleSubmit, reset } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

  useEffect(() => {
    setDisplayedZonas(zonas || []);
  }, [zonas]);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term.trim()) return setDisplayedZonas(zonas);

    const results = await searchZonasByName(term);
    setDisplayedZonas(results || []);
  };

  // --- Crear zona con distribuidor ---
  const onSubmit = async (data) => {
    try {
      const zonaCreada = await createZona({ name: data.zonaName, description: data.zonaDescription });
      setSelectedZonaId(zonaCreada.data.id);

      await createDistribuidor({
        name: data.distribuidorName,
        apellido: data.distribuidorApellido,
        dni: data.distribuidorDni,
        valorEntrega: parseFloat(data.distribuidorValorEntrega),
        zona: zonaCreada.data.id,
      });

      reset();
      refetchZonas();
      alert("Zona y distribuidor creados correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al crear zona o distribuidor");
    }
  };

  // --- Editar zona y distribuidor ---
  const openEditModal = (zona) => {
    setEditingZona(zona);
    const distribuidor = zona.distribuidores?.[0] || null;
    setEditingDistribuidor(distribuidor);
    setSelectedZonaId(zona.id);

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

  const onEditSubmit = async (data) => {
    if (!editingZona) return;

    try {
      await updateZona(editingZona.id, {
        name: data.zonaName,
        description: data.zonaDescription,
      });

      if (editingDistribuidor) {
        await updateDistribuidor({
          id: editingDistribuidor.id,
          data: {
            name: data.distribuidorName,
            apellido: data.distribuidorApellido,
            dni: data.distribuidorDni,
            valorEntrega: parseFloat(data.distribuidorValorEntrega),
            zona: editingZona.id,
          },
        });
      }

      refetchZonas();
      setEditModalOpen(false);
      alert("Zona y distribuidor actualizados correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar zona o distribuidor");
    }
  };

  const handleDelete = async (zonaId, distribuidorId) => {
    if (!window.confirm("¿Eliminar zona y distribuidor asociado?")) return;

    try {
      await deleteZona(zonaId);
      if (distribuidorId) await deleteDistribuidor(distribuidorId);
      refetchZonas();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar zona o distribuidor");
    }
  };

  if (loadingZonas) return <p>Cargando zonas...</p>;

  return (
    <div className="zonas-distribuidores-container">
      <h1>Gestión de Zonas y Distribuidores</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar zonas..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="zonas-list">
        {displayedZonas.map((zona) => {
          const distribuidor = zona.distribuidores?.[0] || null;
          return (
            <div key={zona.id} className="zona-card">
              <div className="zona-actions">
                <button onClick={() => handleDelete(zona.id, distribuidor?.id)}>Eliminar</button>
                <button onClick={() => openEditModal(zona)}>Editar</button>
              </div>
              <div className="zona-info">
                <strong>{zona.name}</strong> - {zona.description}
              </div>
              {distribuidor ? (
                <div className="distribuidor-info">
                  {distribuidor.name} {distribuidor.apellido} - DNI: {distribuidor.dni} - ${distribuidor.valorEntrega}
                </div>
              ) : (
                <div>No hay distribuidor</div>
              )}
            </div>
          );
        })}
      </div>

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Zona y Distribuidor</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)}>
              <input {...registerEdit("zonaName")} placeholder="Nombre de la zona" />
              <input {...registerEdit("zonaDescription")} placeholder="Descripción" />
              <input {...registerEdit("distribuidorName")} placeholder="Nombre" />
              <input {...registerEdit("distribuidorApellido")} placeholder="Apellido" />
              <input {...registerEdit("distribuidorDni")} placeholder="DNI" />
              <input {...registerEdit("distribuidorValorEntrega")} placeholder="Valor de entrega" type="number" step="0.01" />
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <div className="nueva-zona">
        <h2>Crear Nueva Zona con Distribuidor</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("zonaName")} placeholder="Nombre de la zona" />
          <input {...register("zonaDescription")} placeholder="Descripción" />
          <input {...register("distribuidorName")} placeholder="Nombre" />
          <input {...register("distribuidorApellido")} placeholder="Apellido" />
          <input {...register("distribuidorDni")} placeholder="DNI" />
          <input {...register("distribuidorValorEntrega")} placeholder="Valor de entrega" type="number" step="0.01" />
          <button type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default ZonasDistribuidores;
