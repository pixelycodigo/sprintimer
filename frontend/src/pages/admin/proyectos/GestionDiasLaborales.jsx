import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proyectosService } from '../../../services/proyectosService';
import { monedasService } from '../../../services/monedasService';

export default function GestionDiasLaborales() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [diasConfig, setDiasConfig] = useState([]);
  const [costosNoLaborables, setCostosNoLaborables] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [showDiasModal, setShowDiasModal] = useState(false);
  const [showCostosModal, setShowCostosModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estado para formulario de costos
  const [costoForm, setCostoForm] = useState({
    concepto: '',
    monto: '',
    moneda_id: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    cargarProyectos();
    cargarMonedas();
  }, []);

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const response = await proyectosService.listar({ limit: 100 });
      setProyectos(response.proyectos || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMonedas = async () => {
    try {
      const response = await monedasService.listar({ activo: true });
      const monedasList = response.monedas || [];
      setMonedas(monedasList);
      if (monedasList.length > 0) {
        setCostoForm(prev => ({ ...prev, moneda_id: monedasList[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar monedas:', error);
    }
  };

  const handleSeleccionarProyecto = async (proyecto) => {
    setSelectedProyecto(proyecto);
    await cargarDiasLaborables(proyecto.id);
    await cargarCostosNoLaborables(proyecto.id);
  };

  const cargarDiasLaborables = async (proyectoId) => {
    try {
      const response = await proyectosService.obtenerDiasLaborables(proyectoId);
      
      // Si no hay configuración, usar defaults (Lun-Vie laborables)
      if (!response.dias || response.dias.length === 0) {
        const defaults = [
          { dia_semana: 0, es_laborable: false, nombre: 'Domingo' },
          { dia_semana: 1, es_laborable: true, nombre: 'Lunes' },
          { dia_semana: 2, es_laborable: true, nombre: 'Martes' },
          { dia_semana: 3, es_laborable: true, nombre: 'Miércoles' },
          { dia_semana: 4, es_laborable: true, nombre: 'Jueves' },
          { dia_semana: 5, es_laborable: true, nombre: 'Viernes' },
          { dia_semana: 6, es_laborable: false, nombre: 'Sábado' },
        ];
        setDiasConfig(defaults);
      } else {
        setDiasConfig(response.dias);
      }
    } catch (error) {
      console.error('Error al cargar días laborales:', error);
    }
  };

  const cargarCostosNoLaborables = async (proyectoId) => {
    try {
      const response = await proyectosService.obtenerCostosNoLaborables(proyectoId);
      setCostosNoLaborables(response.costos || []);
    } catch (error) {
      console.error('Error al cargar costos:', error);
    }
  };

  const handleToggleDia = async (dia, index) => {
    try {
      const nuevosDias = diasConfig.map((d, i) => 
        i === index ? { ...d, es_laborable: !d.es_laborable } : d
      );
      setDiasConfig(nuevosDias);
      
      // Guardar inmediatamente
      await proyectosService.actualizarDiasLaborables(selectedProyecto.id, nuevosDias);
    } catch (error) {
      console.error('Error al actualizar día:', error);
      // Revertir en caso de error
      await cargarDiasLaborables(selectedProyecto.id);
    }
  };

  const handleGuardarDias = async () => {
    setSaving(true);
    try {
      await proyectosService.actualizarDiasLaborables(selectedProyecto.id, diasConfig);
      setShowDiasModal(false);
    } catch (error) {
      console.error('Error al guardar días:', error);
      alert('Error al guardar la configuración de días');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarCosto = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await proyectosService.actualizarCostosNoLaborables(selectedProyecto.id, {
        concepto: costoForm.concepto,
        monto: parseFloat(costoForm.monto),
        moneda_id: parseInt(costoForm.moneda_id),
        fecha: costoForm.fecha,
      });
      
      setShowCostosModal(false);
      setCostoForm({
        concepto: '',
        monto: '',
        moneda_id: monedas[0]?.id || '',
        fecha: new Date().toISOString().split('T')[0],
      });
      await cargarCostosNoLaborables(selectedProyecto.id);
    } catch (error) {
      console.error('Error al guardar costo:', error);
      alert('Error al guardar el costo');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarCosto = async (costoId) => {
    if (!confirm('¿Eliminar este costo?')) return;
    
    try {
      await proyectosService.eliminarCostoNoLaborable(costoId);
      await cargarCostosNoLaborables(selectedProyecto.id);
    } catch (error) {
      console.error('Error al eliminar costo:', error);
    }
  };

  const diasSemana = [
    { value: 0, nombre: 'Domingo', short: 'Dom' },
    { value: 1, nombre: 'Lunes', short: 'Lun' },
    { value: 2, nombre: 'Martes', short: 'Mar' },
    { value: 3, nombre: 'Miércoles', short: 'Mié' },
    { value: 4, nombre: 'Jueves', short: 'Jue' },
    { value: 5, nombre: 'Viernes', short: 'Vie' },
    { value: 6, nombre: 'Sábado', short: 'Sáb' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Días Laborales</h1>
        <p className="text-slate-600 mt-1">
          Configura los días laborables y costos no laborables por proyecto
        </p>
      </div>

      {/* Lista de Proyectos */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold mb-4">Seleccionar Proyecto</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map((proyecto) => (
              <button
                key={proyecto.id}
                onClick={() => handleSeleccionarProyecto(proyecto)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedProyecto?.id === proyecto.id
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h3 className="font-semibold text-slate-900">{proyecto.nombre}</h3>
                <p className="text-sm text-slate-600 mt-1">{proyecto.cliente_nombre}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  proyecto.estado === 'activo' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {proyecto.estado}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Configuración del Proyecto Seleccionado */}
      {selectedProyecto && (
        <>
          {/* Días Laborables */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Días Laborales - {selectedProyecto.nombre}</h2>
              <button
                onClick={() => setShowDiasModal(true)}
                className="btn-primary text-sm"
              >
                ✏️ Editar Días
              </button>
            </div>

            {diasConfig.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No hay configuración de días laborales
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {diasConfig.map((dia, index) => (
                  <button
                    key={dia.dia_semana}
                    onClick={() => handleToggleDia(dia, index)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      dia.es_laborable
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{dia.nombre || diasSemana[dia.dia_semana]?.short}</div>
                    <div className="text-2xl mt-1">
                      {dia.es_laborable ? '✅' : '❌'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-emerald-100 border-2 border-emerald-500 rounded"></span>
                Laborable
              </span>
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-100 border-2 border-slate-200 rounded"></span>
                No laborable
              </span>
            </div>
          </div>

          {/* Costos No Laborables */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Costos de Días No Laborables</h2>
              <button
                onClick={() => setShowCostosModal(true)}
                className="btn-primary text-sm"
              >
                + Agregar Costo
              </button>
            </div>

            {costosNoLaborables.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No hay costos no laborales configurados
              </p>
            ) : (
              <div className="space-y-2">
                {costosNoLaborables.map((costo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{costo.concepto}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(costo.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {costo.simbolo || '$'} {parseFloat(costo.monto).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">{costo.moneda_codigo}</p>
                      </div>
                      <button
                        onClick={() => handleEliminarCosto(costo.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedProyecto && (
        <div className="text-center py-12 text-slate-500">
          <span className="text-4xl">📅</span>
          <p className="mt-4">Selecciona un proyecto para configurar sus días laborales</p>
        </div>
      )}

      {/* Modal Editar Días */}
      {showDiasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              Editar Días Laborales - {selectedProyecto?.nombre}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Haz click en los días para marcar/desmarcar como laborable
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {diasConfig.map((dia, index) => (
                <button
                  key={dia.dia_semana}
                  onClick={() => handleToggleDia(dia, index)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    dia.es_laborable
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  <div className="font-medium">{dia.nombre || diasSemana[dia.dia_semana]?.nombre}</div>
                  <div className="text-sm">
                    {dia.es_laborable ? '✅ Laborable' : '❌ No laborable'}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDiasModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarDias}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Costo */}
      {showCostosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar Costo No Laborable</h3>
            
            <form onSubmit={handleGuardarCosto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  value={costoForm.concepto}
                  onChange={(e) => setCostoForm({ ...costoForm, concepto: e.target.value })}
                  className="input-base"
                  placeholder="Ej: Feriado Nacional, Bono extra, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costoForm.monto}
                  onChange={(e) => setCostoForm({ ...costoForm, monto: e.target.value })}
                  className="input-base"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Moneda *
                </label>
                <select
                  value={costoForm.moneda_id}
                  onChange={(e) => setCostoForm({ ...costoForm, moneda_id: e.target.value })}
                  className="input-base"
                >
                  {monedas.map((moneda) => (
                    <option key={moneda.id} value={moneda.id}>
                      {moneda.simbolo} - {moneda.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={costoForm.fecha}
                  onChange={(e) => setCostoForm({ ...costoForm, fecha: e.target.value })}
                  className="input-base"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCostosModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Agregar Costo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
