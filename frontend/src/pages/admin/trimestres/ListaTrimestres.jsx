import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trimestresService } from '../../../services/tiempoService';
import { proyectosService } from '../../../services/proyectosService';

export default function ListaTrimestres() {
  const { id: proyecto_id } = useParams();
  const [trimestres, setTrimestres] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  useEffect(() => {
    cargarDatos();
  }, [proyecto_id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (proyecto_id) {
        const response = await trimestresService.listar(proyecto_id);
        setTrimestres(response.trimestres || []);
      } else {
        const proyectosRes = await proyectosService.listar({ limit: 100 });
        setProyectos(proyectosRes.proyectos || []);
        const allTrimestres = [];
        for (const proyecto of proyectosRes.proyectos || []) {
          const trimRes = await trimestresService.listar(proyecto.id);
          allTrimestres.push(...(trimRes.trimestres || []).map(t => ({...t, proyecto_nombre: proyecto.nombre})));
        }
        setTrimestres(allTrimestres);
      }
    } catch (error) {
      console.error('Error al cargar trimestres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await trimestresService.crear(proyecto_id, formData);
      setShowForm(false);
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      cargarTrimestres();
    } catch (error) {
      console.error('Error al crear trimestre:', error);
      alert(error.response?.data?.message || 'Error al crear trimestre');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este trimestre?')) return;
    try {
      await trimestresService.eliminar(id, 'Eliminado desde frontend');
      cargarTrimestres();
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
          <h1 className="text-2xl font-bold text-slate-900">Trimestres</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los trimestres fiscales del proyecto
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Trimestre
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Trimestre</h2>
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
                placeholder="Ej: Q1 2026"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
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
        {trimestres.length === 0 ? (
          <div className="card-base p-12 text-center">
            <span className="text-4xl">📆</span>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              No hay trimestres registrados
            </h3>
            <p className="text-slate-600 mt-2">
              {proyecto_id 
                ? 'Comienza creando un nuevo trimestre para este proyecto'
                : 'Los proyectos no tienen trimestres registrados'}
            </p>
          </div>
        ) : (
          trimestres.map((trimestre) => (
            <div key={trimestre.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{trimestre.nombre}</h3>
                  {!proyecto_id && trimestre.proyecto_nombre && (
                    <p className="text-xs text-slate-500 mt-1">📦 {trimestre.proyecto_nombre}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(trimestre.fecha_inicio).toLocaleDateString()} - {new Date(trimestre.fecha_fin).toLocaleDateString()}
                  </p>
                </div>
                {proyecto_id && (
                  <button
                    onClick={() => handleEliminar(trimestre.id)}
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
