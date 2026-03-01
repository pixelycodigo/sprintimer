import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ListaSprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar carga de sprints desde API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sprints</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los sprints de los proyectos
          </p>
        </div>
        <Link to="/admin/sprints/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Sprint
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : sprints.length === 0 ? (
        <div className="card-base p-12 text-center">
          <span className="text-4xl">📅</span>
          <h3 className="text-lg font-semibold text-slate-900 mt-4">
            No hay sprints registrados
          </h3>
          <p className="text-slate-600 mt-2">
            Comienza creando un nuevo sprint para un proyecto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{sprint.nombre}</h3>
                  <p className="text-sm text-slate-600">{sprint.proyecto}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    {sprint.fecha_inicio} - {sprint.fecha_fin}
                  </span>
                  <Link to={`/admin/sprints/${sprint.id}`} className="btn-secondary text-sm">
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
