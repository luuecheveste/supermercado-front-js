import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useZonas from "../../hooks/useZonas";
import useDistribuidor from "../../hooks/useDistribuidor";
import "./Zonas-distribuidores.css";

const ZonasDistribuidores = () => {
  const {
    zonas,
    isLoading: loadingZonas,
    createZona,
    updateZona,
    deleteZona,
    searchZonasByName,
    refetch: refetchZonas,
  } = useZonas();

  const [selectedZonaId, setSelectedZonaId] = useState(null);
  const { createDistribuidor, updateDistribuidor, deleteDistribuidor } =
    useDistribuidor(selectedZonaId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [editingDistribuidor, setEditingDistribuidor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedZonas, setDisplayedZonas] = useState([]);

  const { register, handleSubmit, reset } = useForm();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm();

  // Mantener la lista de zonas actualizada
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

  const onSubmit = async (data) => {
    try {
      const zonaCreada = await createZona({
        name: data.zonaName,
        description: data.zonaDescription,
      });
      setSelectedZonaId(zonaCreada.data.id);

      await createDistribuidor({
        name: data.distribuidorName,
        apellido: data.distribuidorApellido,
        dni: data.distribuidorDni,
        valorEntrega: parseFloat(data.distribuidorValorEntrega),
        zona: zonaCreada.data.id,
      });

      alert("Zona y distribuidor creados exitosamente ✅");
      reset();
      const nuevasZonas = await refetchZonas();
      setDisplayedZonas(nuevasZonas || []);
    } catch (err) {
      console.error(err);
      alert("Error al crear zona o distribuidor ❌");
    }
  };

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

      alert("Zona y distribuidor actualizados exitosamente ✅");
      const nuevasZonas = await refetchZonas();
      setDisplayedZonas(nuevasZonas || []);
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar zona o distribuidor ❌");
    }
  };

  const handleDelete = async (zonaId) => {
    if (!window.confirm("¿Eliminar zona y distribuidor asociado?")) return;

    try {
      const zona = zonas.find((z) => z.id === zonaId);
      const distribuidorId = zona?.distribuidores?.[0]?.id;

      // Eliminamos ambos en paralelo
      await Promise.all([
        distribuidorId ? deleteDistribuidor(distribuidorId) : Promise.resolve(),
        deleteZona(zonaId),
      ]);

      const nuevasZonas = await refetchZonas();
      setDisplayedZonas(nuevasZonas || []);
      alert("Zona y distribuidor eliminados correctamente!✅"); 
    } catch (err) {
      console.error(err); 
      alert("Error al eliminar zona o distribuidor ❌");
    }
  }; 

  if (loadingZonas)
    return <p className="loading-message">Cargando zonas...</p>;

  return (
    <div className="zonas-distribuidores-container">
      <h1>Gestión de Zonas y Distribuidores</h1>

      {/* Búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar zonas..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Lista de zonas */}
      <div className="zonas-list">
        {displayedZonas.length === 0 && (
          <p className="empty-state">
            {searchTerm ? "No se encontraron zonas" : "No hay zonas creadas"}
          </p>
        )}
        {displayedZonas.map((zona) => {
          const distribuidor = zona.distribuidores?.[0] || null;
          return (
            <div key={zona.id} className="zona-card compact">
              <div className="zona-actions-floating">
                <button
                  onClick={() => handleDelete(zona.id)}
                  title="Eliminar zona y distribuidor"
                >
                  ✖
                </button>
                <button
                  onClick={() => openEditModal(zona)}
                  title="Editar zona y distribuidor"
                >
                  ✎
                </button>
              </div>

              <div className="zona-content">
                <h3>{zona.name}</h3>
                <p className="zona-description">{zona.description}</p>

                {distribuidor ? (
                  <div className="distribuidor-card compact">
                    <p>
                      <strong>Distribuidor:</strong> {distribuidor.name}{" "}
                      {distribuidor.apellido}
                    </p>
                    <p>
                      <strong>DNI:</strong> {distribuidor.dni} |{" "}
                      <strong>Valor entrega:</strong> ${distribuidor.valorEntrega}
                    </p>
                  </div>
                ) : (
                  <div className="distribuidor-card empty compact">
                    <em>No hay distribuidor asociado</em>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal compact">
            <h3>Editar Zona y Distribuidor</h3>
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="form-modal">
              <div className="form-section compact">
                <h4>Zona</h4>
                <input {...registerEdit("zonaName")} placeholder="Nombre de la zona" />
                <input {...registerEdit("zonaDescription")} placeholder="Descripción" />
              </div>
              <div className="form-section compact">
                <h4>Distribuidor</h4>
                <input {...registerEdit("distribuidorName")} placeholder="Nombre" />
                <input {...registerEdit("distribuidorApellido")} placeholder="Apellido" />
                <input {...registerEdit("distribuidorDni")} placeholder="DNI" />
                <input
                  {...registerEdit("distribuidorValorEntrega")}
                  placeholder="Valor de entrega"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crear nueva zona */}
      <div className="nueva-zona">
        <h2>Crear Nueva Zona con Distribuidor</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form-create">
          <div className="form-section compact">
            <h4>Zona</h4>
            <input {...register("zonaName")} placeholder="Nombre de la zona" />
            <input {...register("zonaDescription")} placeholder="Descripción" />
          </div>
          <div className="form-section compact">
            <h4>Distribuidor</h4>
            <input {...register("distribuidorName")} placeholder="Nombre" />
            <input {...register("distribuidorApellido")} placeholder="Apellido" />
            <input {...register("distribuidorDni")} placeholder="DNI" />
            <input
              {...register("distribuidorValorEntrega")}
              placeholder="Valor de entrega"
              type="number"
              step="0.01"
            />
          </div>
          <button type="submit" className="btn-submit">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZonasDistribuidores;
