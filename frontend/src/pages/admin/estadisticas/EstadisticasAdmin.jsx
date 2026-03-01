import { useState, useEffect } from 'react';
import { estadisticasService } from '../../../services/estadisticasService';
import { HorasPorUsuarioChart, HorasPorDiaChart, ProgresoSprintsChart } from '../../../components/estadisticas/Charts';

export default function EstadisticasAdmin() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [horasPorUsuario, setHorasPorUsuario] = useState([]);
  const [horasPorDia, setHorasPorDia] = useState([]);
  const [progresoSprints, setProgresoSprints] = useState([]);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [resumenRes, horasUsuarioRes, horasDiaRes, sprintsRes] = await Promise.all([
        estadisticasService.obtenerResumenAdmin(),
        estadisticasService.horasPorUsuario({ limit: 10 }),
        estadisticasService.horasPorDia({ dias: 30 }),
        estadisticasService.progresoSprints(),
      ]);

      setResumen(resumenRes.resumen);
      setHorasPorUsuario(horasUsuarioRes.datos);
      setHorasPorDia(horasDiaRes.datos);
      setProgresoSprints(sprintsRes.sprints);
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
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas</h1>
        <p className="text-slate-600 mt-1">Métricas y reportes del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Usuarios</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.total_usuarios || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              👥
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Proyectos</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.total_proyectos || 0}
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
              <p className="text-sm text-slate-600">Tareas</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.total_tareas || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Horas Totales</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.total_horas?.toFixed(2) || '0.00'}h
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              ⏱️
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cortes Pendientes</p>
              <p className="text-3xl font-bold text-slate-900 data-number mt-1">
                {resumen?.cortes_pendientes || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horas por Usuario */}
        <div className="card-base p-6">
          {horasPorUsuario.length > 0 ? (
            <HorasPorUsuarioChart data={horasPorUsuario} />
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Horas por Día */}
        <div className="card-base p-6">
          {horasPorDia.length > 0 ? (
            <HorasPorDiaChart data={horasPorDia} />
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Progreso de Sprints */}
      <div className="card-base p-6">
        {progresoSprints.length > 0 ? (
          <ProgresoSprintsChart data={progresoSprints} />
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            No hay datos disponibles
          </div>
        )}
      </div>
    </div>
  );
}
