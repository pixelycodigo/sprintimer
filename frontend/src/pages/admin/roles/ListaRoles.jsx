import { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function ListaRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    nivel: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setEditingRole(null);
    setFormData({ nombre: '', descripcion: '', nivel: '' });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleEditar = (rol) => {
    setEditingRole(rol);
    setFormData({
      nombre: rol.nombre,
      descripcion: rol.descripcion || '',
      nivel: rol.nivel,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingRole) {
        // Actualizar rol existente
        await api.put(`/admin/roles/${editingRole.id}`, formData);
        setSuccess('Rol actualizado exitosamente');
      } else {
        // Crear nuevo rol
        await api.post('/admin/roles', formData);
        setSuccess('Rol creado exitosamente');
      }
      
      setShowForm(false);
      cargarRoles();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar rol');
    }
  };

  const handleEliminar = async (rol) => {
    if (rol.nombre === 'usuario' || rol.nombre === 'admin' || rol.nombre === 'super_admin') {
      alert('No se pueden eliminar los roles base del sistema');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el rol "${rol.nombre}"?`)) return;

    try {
      await api.delete(`/admin/roles/${rol.id}`);
      setSuccess('Rol eliminado exitosamente');
      cargarRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setEditingRole(null);
    setFormData({ nombre: '', descripcion: '', nivel: '' });
    setError('');
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
          <h1 className="text-2xl font-bold text-slate-900">Roles del Sistema</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los roles disponibles en el sistema
          </p>
        </div>
        <button onClick={handleNuevo} className="btn-primary">
          <span className="text-lg mr-2">+</span>
          Nuevo Rol
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
          </h2>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  className="input-base"
                  placeholder="ej: coordinator"
                  required
                  disabled={!!editingRole}
                />
                <p className="text-xs text-slate-500 mt-1">Solo letras minúsculas y guiones bajos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nivel *
                </label>
                <input
                  type="number"
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                  className="input-base"
                  placeholder="ej: 2"
                  required
                  min="1"
                />
                <p className="text-xs text-slate-500 mt-1">Mayor número = más permisos</p>
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
                placeholder="Descripción del rol y sus responsabilidades"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingRole ? 'Actualizar' : 'Crear'} Rol
              </button>
              <button type="button" onClick={handleCancelar} className="btn-secondary">
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Usuarios
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {roles.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  No hay roles registrados
                </td>
              </tr>
            ) : (
              roles.map((rol) => (
                <tr key={rol.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        rol.nombre === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : rol.nombre === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rol.nombre.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      {rol.descripcion || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      Nivel {rol.nivel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {rol.total_usuarios || 0} usuarios
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditar(rol)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {(rol.nombre !== 'usuario' && rol.nombre !== 'admin' && rol.nombre !== 'super_admin') && (
                        <button
                          onClick={() => handleEliminar(rol)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Nota:</strong> Los roles base del sistema (usuario, admin, super_admin) no se pueden eliminar.
          Para asignar roles personalizados a usuarios en un proyecto, usa la función "Asignar Usuarios" en cada proyecto.
        </p>
      </div>
    </div>
  );
}
