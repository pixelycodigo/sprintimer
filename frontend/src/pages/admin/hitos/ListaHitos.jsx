import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hitosService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';

export default function ListaHitos() {
  const { id: proyecto_id } = useParams();
  const [hitos, setHitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_limite: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [proyecto_id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (proyecto_id) {
        const response = await hitosService.listar(proyecto_id);
        setHitos(response.hitos || []);
      } else {
        const proyectosRes = await proyectosService.listar({ limit: 100 });
        setProyectos(proyectosRes.proyectos || []);
        const allHitos = [];
        for (const proyecto of proyectosRes.proyectos || []) {
          const hitosRes = await hitosService.listar(proyecto.id);
          allHitos.push(...(hitosRes.hitos || []).map(h => ({...h, proyecto_nombre: proyecto.nombre})));
        }
        setHitos(allHitos);
      }
    } catch (error) {
      console.error('Error al cargar hitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await hitosService.crear(proyecto_id, formData);
      setShowForm(false);
      setFormData({ nombre: '', descripcion: '', fecha_limite: '' });
      cargarHitos();
    } catch (error) {
      console.error('Error al crear hito:', error);
      alert(error.response?.data?.message || 'Error al crear hito');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este hito?')) return;
    try {
      await hitosService.eliminar(id, 'Eliminado desde frontend');
      cargarHitos();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hitos</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los hitos del proyecto
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Hito
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Hito</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                className="input-base"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {hitos.length === 0 ? (
          <div className="card-base p-12 text-center">
            <span className="text-4xl">🎯</span>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              No hay hitos registrados
            </h3>
            <p className="text-slate-600 mt-2">
              {proyecto_id 
                ? 'Comienza creando un nuevo hito para este proyecto'
                : 'Los proyectos no tienen hitos registrados'}
            </p>
          </div>
        ) : (
          hitos.map((hito) => (
            <div key={hito.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{hito.nombre}</h3>
                  {hito.descripcion && (
                    <p className="text-sm text-slate-600 mt-1">{hito.descripcion}</p>
                  )}
                  {!proyecto_id && hito.proyecto_nombre && (
                    <p className="text-xs text-slate-500 mt-1">📦 {hito.proyecto_nombre}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">
                    📅 {new Date(hito.fecha_limite).toLocaleDateString()}
                  </p>
                </div>
                {proyecto_id && (
                  <button
                    onClick={() => handleEliminar(hito.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
