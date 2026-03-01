import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cortesService } from '../../../services/cortesService';

export default function DetalleCorte() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [corte, setCorte] = useState(null);
  const [recalculando, setRecalculando] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    cargarCorte();
  }, [id]);

  const cargarCorte = async () => {
    setLoading(true);
    try {
      const response = await cortesService.obtenerDetalle(id);
      setCorte(response.corte);
    } catch (error) {
      console.error('Error al cargar corte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalcular = async () => {
    if (!confirm('¿Recalcular este corte? Esta acción no se puede deshacer.')) return;
    
    setRecalculando(true);
    try {
      await cortesService.recalcular(id, motivo);
      alert('Corte recalculado exitosamente');
      cargarCorte();
      setMotivo('');
    } catch (error) {
      alert('Error al recalcular: ' + (error.response?.data?.message || error.message));
    } finally {
      setRecalculando(false);
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

  if (!corte) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Corte no encontrado</p>
        <Link to="/admin/cortes" className="btn-primary mt-4 inline-block">
          Volver a cortes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/cortes" className="text-slate-400 hover:text-slate-600">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Detalle de Corte</h1>
            <p className="text-slate-600 mt-1">
              {corte.usuario_nombre} - {corte.proyecto_nombre}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {corte.estado !== 'pagado' && (
            <button
              onClick={() => handleRecalcular()}
              disabled={recalculando}
              className="btn-secondary text-amber-600 hover:bg-amber-50 disabled:opacity-50"
            >
              🔄 Recalcular
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="btn-primary"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-base p-6">
          <p className="text-sm text-slate-600">Período</p>
          <p className="text-lg font-bold text-slate-900 data-number mt-1">
            {new Date(corte.periodo_inicio).toLocaleDateString('es-ES')}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(corte.periodo_fin).toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="card-base p-6">
          <p className="text-sm text-slate-600">Horas Trabajadas</p>
          <p className="text-3xl font-bold text-amber-600 data-number mt-1">
            {parseFloat(corte.total_horas).toFixed(2)}h
          </p>
        </div>

        <div className="card-base p-6">
          <p className="text-sm text-slate-600">Costo por Hora</p>
          <p className="text-2xl font-bold text-slate-900 money mt-1">
            {corte.moneda_simbolo} {parseFloat(corte.costo_hora_aplicado).toFixed(2)}
          </p>
        </div>

        <div className="card-base p-6 bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700">Total a Pagar</p>
          <p className="text-4xl font-bold text-emerald-700 money mt-1">
            {corte.moneda_simbolo} {parseFloat(corte.total_pagar).toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {corte.moneda_codigo}
          </p>
        </div>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horas por Actividad */}
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Horas por Actividad</h2>
          {corte.horas_por_actividad && corte.horas_por_actividad.length > 0 ? (
            <div className="space-y-3">
              {corte.horas_por_actividad.map((actividad, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">{actividad.actividad_nombre}</span>
                  <span className="text-sm font-bold text-amber-600 data-number">
                    {parseFloat(actividad.total_horas).toFixed(2)}h
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay actividades registradas</p>
          )}
        </div>

        {/* Bonos */}
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bonos</h2>
          {corte.bonos && corte.bonos.length > 0 ? (
            <div className="space-y-3">
              {corte.bonos.map((bono, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">{bono.concepto}</span>
                  <span className="text-sm font-bold text-emerald-600 money">
                    {corte.moneda_simbolo} {parseFloat(bono.monto).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No hay bonos aplicados</p>
          )}
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen Financiero</h2>
        <div className="space-y-3 max-w-md">
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Horas trabajadas</span>
            <span className="text-slate-900 money">
              {parseFloat(corte.total_horas).toFixed(2)}h × {corte.moneda_simbolo}{parseFloat(corte.costo_hora_aplicado).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Subtotal horas</span>
            <span className="text-slate-900 money">
              {corte.moneda_simbolo} {parseFloat(corte.subtotal_horas).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Total bonos</span>
            <span className="text-emerald-600 money">
              + {corte.moneda_simbolo} {parseFloat(corte.total_bonos).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 bg-emerald-50 px-4 rounded-lg mt-4">
            <span className="font-bold text-slate-900">TOTAL A PAGAR</span>
            <span className="text-2xl font-bold text-emerald-700 money">
              {corte.moneda_simbolo} {parseFloat(corte.total_pagar).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Estado y Acciones */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Estado del corte</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{corte.estado}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/cortes" className="btn-secondary">
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Recalcular Modal (inline) */}
      {recalculando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-base p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recalcular Corte</h3>
            <p className="text-slate-600 mb-4">
              Ingresa el motivo del recálculo:
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="input-base min-h-[100px]"
              placeholder="Ej: Cambio de costo por hora retroactivo..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRecalcular}
                disabled={!motivo}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {recalculando ? 'Recalculando...' : 'Recalcular'}
              </button>
              <button
                onClick={() => {
                  setRecalculando(false);
                  setMotivo('');
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
