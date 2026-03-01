import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ListaActividades() {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar carga de actividades desde API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actividades</h1>
          <p className="text-slate-600 mt-1">
            Gestiona las actividades disponibles para registro de tiempo
          </p>
        </div>
        <Link to="/admin/actividades/crear" className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nueva Actividad
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : actividades.length === 0 ? (
        <div className="card-base p-12 text-center">
          <span className="text-4xl">✅</span>
          <h3 className="text-lg font-semibold text-slate-900 mt-4">
            No hay actividades registradas
          </h3>
          <p className="text-slate-600 mt-2">
            Comienza creando una nueva actividad
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {actividades.map((actividad) => (
            <div key={actividad.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{actividad.nombre}</h3>
                  <p className="text-sm text-slate-600">{actividad.descripcion}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    actividad.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {actividad.activo ? 'Activa' : 'Inactiva'}
                  </span>
                  <Link to={`/admin/actividades/${actividad.id}`} className="btn-secondary text-sm">
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
