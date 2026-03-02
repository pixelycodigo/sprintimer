import { useState, useEffect } from 'react';
import { costosService } from '../../../services/costosService';
import { usuariosService } from '../../../services/usuariosService';
import { monedasService } from '../../../services/monedasService';

export default function CostosPorHora() {
  const [costos, setCostos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    usuario_id: '',
    costo_hora: '',
    moneda_id: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    tipo_alcance: 'global',
    concepto: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [costosRes, usuariosRes, monedasRes] = await Promise.all([
        costosService.listar(),
        usuariosService.listar({ limit: 100 }),
        monedasService.listar({ activo: true })
      ]);
      setCostos(costosRes.costos || []);
      setUsuarios(usuariosRes.usuarios?.filter(u => u.rol !== 'super_admin') || []);
      setMonedas(monedasRes.monedas || []);
      if (monedasRes.monedas?.length > 0) {
        setFormData(prev => ({ ...prev, moneda_id: monedasRes.monedas[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setCostos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!formData.usuario_id) {
      alert('Selecciona un usuario');
      return;
    }
    try {
      await costosService.crear(formData.usuario_id, {
        costo_hora: parseFloat(formData.costo_hora),
        moneda_id: formData.moneda_id,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        tipo_alcance: formData.tipo_alcance,
        concepto: formData.concepto,
      });
      setShowForm(false);
      setFormData({
        usuario_id: '',
        costo_hora: '',
        moneda_id: monedas[0]?.id || '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        tipo_alcance: 'global',
        concepto: '',
      });
      cargarDatos();
    } catch (error) {
      console.error('Error al crear costo:', error);
      alert(error.response?.data?.message || 'Error al crear costo');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este costo?')) return;
    try {
      await costosService.eliminar(id);
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
          <h1 className="text-2xl font-bold text-slate-900">Costos por Hora</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los costos por hora de los usuarios
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Costo
        </button>
      </div>

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo Costo por Hora</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario
                </label>
                <select
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Costo por Hora
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costo_hora}
                  onChange={(e) => setFormData({ ...formData, costo_hora: e.target.value })}
                  className="input-base"
                  placeholder="Ej: 50.00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  Tipo de Alcance
                </label>
                <select
                  value={formData.tipo_alcance}
                  onChange={(e) => setFormData({ ...formData, tipo_alcance: e.target.value })}
                  className="input-base"
                >
                  <option value="global">Global</option>
                  <option value="proyecto">Por Proyecto</option>
                  <option value="sprint">Por Sprint</option>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Concepto (opcional)
              </label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                className="input-base"
                placeholder="Ej: Aumento por desempeño"
              />
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

      <div className="card-base overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Costo/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Moneda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {costos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  No hay costos por hora registrados
                </td>
              </tr>
            ) : (
              costos.map((costo) => (
                <tr key={costo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {costo.usuario_nombre || 'Usuario'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {costo.costo_hora}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {costo.moneda_simbolo || costo.moneda_codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(costo.fecha_inicio).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {costo.tipo_alcance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEliminar(costo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
