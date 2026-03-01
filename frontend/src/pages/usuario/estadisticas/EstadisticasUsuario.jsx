import { useState, useEffect } from 'react';
import { estadisticasService } from '../../../services/estadisticasService';

export default function EstadisticasUsuario() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [horasSemanales, setHorasSemanales] = useState([]);
  const [planificacion, setPlanificacion] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [resumenRes, horasSemanalesRes, planificacionRes] = await Promise.all([
        estadisticasService.obtenerResumenUsuario(),
        estadisticasService.horasSemanales({ semanas: 4 }),
        estadisticasService.planificacionDiaria(),
      ]);

      setResumen(resumenRes.resumen);
      setHorasSemanales(horasSemanalesRes.datos);
      setPlanificacion(planificacionRes);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Estadísticas</h1>
        <p className="text-slate-600 mt-1">Tu progreso y rendimiento personal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Tareas</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.total_tareas || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Horas Totales</p>
              <p className="text-3xl font-bold text-amber-600 data-number mt-1">
                {resumen?.total_horas?.toFixed(2) || '0.00'}h
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              ⏱️
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Proyectos Activos</p>
              <p className="text-3xl font-bold text-emerald-600 data-number mt-1">
                {resumen?.proyectos_activos || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              📦
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Horas Semanales</p>
              <p className="text-3xl font-bold text-purple-600 data-number mt-1">
                {horasSemanales.reduce((sum, s) => sum + s.total_horas, 0).toFixed(1)}h
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Horas Semanales Chart */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Horas por Semana</h2>
        <div className="grid grid-cols-4 gap-4">
          {horasSemanales.map((semana, index) => (
            <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2">Semana {semana.semana}</p>
              <p className="text-2xl font-bold text-slate-900 data-number">
                {semana.total_horas.toFixed(1)}h
              </p>
              <p className="text-xs text-slate-500 mt-1">{semana.total_tareas} tareas</p>
            </div>
          ))}
        </div>
      </div>

      {/* Planificación Diaria */}
      {planificacion && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Planificación Diaria Recomendada</h2>
          
          {planificacion.alerta_sobrecarga && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Alerta de Sobrecarga:</strong> {planificacion.recomendacion}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planificacion.proyectos.map((proyecto, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">{proyecto.proyecto_nombre}</h3>
                <p className="text-sm text-slate-600 mb-3">{proyecto.sprint_nombre}</p>
                
                <div className="space-y-2">
                  {proyecto.actividades.map((actividad, actIndex) => (
                    <div key={actIndex} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 truncate">{actividad.actividad_nombre}</span>
                      <span className={`font-medium data-number ${
                        actividad.estado === 'retrasado' ? 'text-red-600' :
                        actividad.estado === 'ligeramente_retrasado' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {actividad.horas_diarias_recomendadas.toFixed(1)}h/día
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total diario</span>
                    <span className="text-sm font-bold text-slate-900 data-number">
                      {proyecto.horas_diarias_totales.toFixed(1)}h/día
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {planificacion.total_horas_diarias > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Total horas diarias recomendadas</span>
                <span className={`text-lg font-bold data-number ${
                  planificacion.total_horas_diarias > 8 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {planificacion.total_horas_diarias.toFixed(1)}h/día
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {planificacion.recomendacion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tareas por Estado */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tareas por Estado</h2>
        <div className="grid grid-cols-3 gap-4">
          {resumen?.tareas_por_estado.map((estado, index) => (
            <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 capitalize mb-1">
                {estado.estado.replace('_', ' ')}
              </p>
              <p className="text-3xl font-bold text-slate-900 data-number">
                {estado.cantidad}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
