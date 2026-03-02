import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proyectosService } from '../../../services/proyectosService';
import { sprintsService } from '../../../services/tiempoService';

export default function ListaSprints() {
  const [sprints, setSprints] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroProyecto, setFiltroProyecto] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [filtroProyecto]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const proyectosRes = await proyectosService.listar({ limit: 100 });
      setProyectos(proyectosRes.proyectos || []);

      let allSprints = [];
      if (filtroProyecto) {
        const response = await sprintsService.listar(filtroProyecto);
        allSprints = (response.sprints || []).map(s => ({
          ...s,
          proyecto_nombre: proyectosRes.proyectos?.find(p => p.id === parseInt(filtroProyecto))?.nombre
        }));
      } else {
        for (const proyecto of proyectosRes.proyectos || []) {
          const response = await sprintsService.listar(proyecto.id);
          allSprints.push(...(response.sprints || []).map(s => ({...s, proyecto_nombre: proyecto.nombre})));
        }
      }
      setSprints(allSprints);
    } catch (error) {
      console.error('Error al cargar sprints:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Sprints</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los sprints de todos los proyectos
          </p>
        </div>
      </div>

      {/* Filtro por proyecto */}
      <div className="card-base p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Filtrar por proyecto
        </label>
        <select
          value={filtroProyecto}
          onChange={(e) => setFiltroProyecto(e.target.value)}
          className="input-base w-full max-w-md"
        >
          <option value="">Todos los proyectos</option>
          {proyectos.map((proyecto) => (
            <option key={proyecto.id} value={proyecto.id}>
              {proyecto.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sprints.length === 0 ? (
          <div className="card-base p-12 text-center">
            <span className="text-4xl">📅</span>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              No hay sprints registrados
            </h3>
            <p className="text-slate-600 mt-2">
              Los proyectos no tienen sprints registrados
            </p>
          </div>
        ) : (
          sprints.map((sprint) => (
            <div key={sprint.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{sprint.nombre}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(sprint.fecha_inicio).toLocaleDateString()} - {new Date(sprint.fecha_fin).toLocaleDateString()}
                  </p>
                  {sprint.proyecto_nombre && (
                    <p className="text-xs text-slate-500 mt-1">📦 {sprint.proyecto_nombre}</p>
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
