import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { actividadesService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';

export default function ListaActividades() {
  const { id: proyecto_id } = useParams();
  const [actividades, setActividades] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'pendiente',
  });

  useEffect(() => {
    cargarDatos();
  }, [proyecto_id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (proyecto_id) {
        // Modo: actividades de un proyecto específico
        const response = await actividadesService.listar(proyecto_id);
        setActividades(response.actividades || []);
      } else {
        // Modo: todas las actividades (global)
        const proyectosRes = await proyectosService.listar({ limit: 100 });
        setProyectos(proyectosRes.proyectos || []);
        // Cargar actividades de todos los proyectos
        const allActividades = [];
        for (const proyecto of proyectosRes.proyectos || []) {
          const actRes = await actividadesService.listar(proyecto.id);
          allActividades.push(...(actRes.actividades || []).map(a => ({...a, proyecto_nombre: proyecto.nombre})));
        }
        setActividades(allActividades);
      }
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await actividadesService.crear(proyecto_id, formData);
      setShowForm(false);
      setFormData({ nombre: '', descripcion: '', estado: 'pendiente' });
      cargarActividades();
    } catch (error) {
      console.error('Error al crear actividad:', error);
      alert(error.response?.data?.message || 'Error al crear actividad');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      await actividadesService.eliminar(id, 'Eliminado desde frontend');
      cargarActividades();
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
          <h1 className="text-2xl font-bold text-slate-900">Actividades</h1>
          <p className="text-slate-600 mt-1">
            Gestiona las actividades del proyecto
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nueva Actividad
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nueva Actividad</h2>
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
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="input-base"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
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
        {actividades.length === 0 ? (
          <div className="card-base p-12 text-center">
            <span className="text-4xl">✅</span>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              No hay actividades registradas
            </h3>
            <p className="text-slate-600 mt-2">
              {proyecto_id 
                ? 'Comienza creando una nueva actividad para este proyecto'
                : 'Los proyectos no tienen actividades registradas'}
            </p>
            {proyecto_id && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
                <span className="text-lg mr-2">+</span>
                Nueva Actividad
              </button>
            )}
          </div>
        ) : (
          actividades.map((actividad) => (
            <div key={actividad.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{actividad.nombre}</h3>
                  {actividad.descripcion && (
                    <p className="text-sm text-slate-600 mt-1">{actividad.descripcion}</p>
                  )}
                  {!proyecto_id && actividad.proyecto_nombre && (
                    <p className="text-xs text-slate-500 mt-1">📦 {actividad.proyecto_nombre}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    actividad.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                    actividad.estado === 'en_progreso' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {actividad.estado === 'en_progreso' ? 'En Progreso' : 
                     actividad.estado === 'completada' ? 'Completada' : 'Pendiente'}
                  </span>
                  {proyecto_id && (
                    <button
                      onClick={() => handleEliminar(actividad.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
