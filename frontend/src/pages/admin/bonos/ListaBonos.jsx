import { useState, useEffect } from 'react';
import { bonosService } from '../../../services/bonosService';
import { monedasService } from '../../../services/monedasService';

export default function ListaBonos() {
  const [bonos, setBonos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    monto: '',
    moneda_id: '',
    periodo: 'mensual',
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [bonosRes, monedasRes] = await Promise.all([
        bonosService.listar(),
        monedasService.listar({ activo: true })
      ]);
      setBonos(bonosRes.bonos || []);
      setMonedas(monedasRes.monedas || []);
      if (monedasRes.monedas?.length > 0) {
        setFormData(prev => ({ ...prev, moneda_id: monedasRes.monedas[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await bonosService.crear({
        ...formData,
        monto: parseFloat(formData.monto),
      });
      setShowForm(false);
      setFormData({
        nombre: '',
        descripcion: '',
        monto: '',
        moneda_id: monedas[0]?.id || '',
        periodo: 'mensual',
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al crear bono:', error);
      alert(error.response?.data?.message || 'Error al crear bono');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este bono?')) return;
    try {
      await bonosService.eliminar(id, 'Eliminado desde frontend');
      cargarDatos();
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
          <h1 className="text-2xl font-bold text-slate-900">Bonos</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los bonos e incentivos disponibles
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Bono
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Bono</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="Ej: Bono por Rendimiento"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Moneda
                </label>
                <select
                  value={formData.moneda_id}
                  onChange={(e) => setFormData({ ...formData, moneda_id: e.target.value })}
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
                  Periodo
                </label>
                <select
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  className="input-base"
                >
                  <option value="mensual">Mensual</option>
                  <option value="unico">Único</option>
                  <option value="por_proyecto">Por Proyecto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.activo ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  className="input-base"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
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
                  Fecha Fin (opcional)
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-base"
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
        {bonos.length === 0 ? (
          <div className="card-base p-12 text-center">
            <span className="text-4xl">💵</span>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              No hay bonos registrados
            </h3>
            <p className="text-slate-600 mt-2">
              Comienza creando un nuevo bono
            </p>
          </div>
        ) : (
          bonos.map((bono) => (
            <div key={bono.id} className="card-base p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{bono.nombre}</h3>
                  {bono.descripcion && (
                    <p className="text-sm text-slate-600 mt-1">{bono.descripcion}</p>
                  )}
                  <p className="text-sm text-slate-500 mt-1">
                    💰 {bono.monto} {bono.simbolo || bono.moneda_codigo} | 
                    📅 {bono.periodo} | 
                    {bono.activo ? ' ✅ Activo' : ' ❌ Inactivo'}
                  </p>
                </div>
                <button
                  onClick={() => handleEliminar(bono.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
