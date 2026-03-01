import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { proyectosService } from '../../../services/proyectosService';
import { usuariosService } from '../../../services/usuariosService';

export default function AsignarUsuariosProyecto() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [asignados, setAsignados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [rol_en_proyecto, setRol_en_proyecto] = useState('miembro');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [proyectoRes, usuariosRes, asignadosRes] = await Promise.all([
        proyectosService.obtener(id),
        usuariosService.listar({ limit: 100 }),
        proyectosService.obtenerUsuariosAsignados(id),
      ]);
      setProyecto(proyectoRes.proyecto);
      setUsuarios(usuariosRes.usuarios);
      setAsignados(asignadosRes.usuarios);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!usuarioId) return;

    try {
      await proyectosService.asignarUsuario(id, usuarioId, rol_en_proyecto);
      setSuccess('Usuario asignado exitosamente');
      setUsuarioId('');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar usuario');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDesasignar = async (usuario_id) => {
    if (!confirm('¿Desasignar usuario del proyecto?')) return;
    
    try {
      await proyectosService.desasignarUsuario(id, usuario_id);
      setSuccess('Usuario desasignado');
      cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al desasignar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const usuariosNoAsignados = usuarios.filter(
    u => !asignados.find(a => a.usuario_id === u.id)
  );

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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/proyectos" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asignar Usuarios</h1>
          <p className="text-slate-600 mt-1">{proyecto?.nombre}</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Asignación */}
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Asignar Nuevo Usuario</h2>
          
          <form onSubmit={handleAsignar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Usuario *
              </label>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                className="input-base"
                required
              >
                <option value="">Seleccionar usuario</option>
                {usuariosNoAsignados.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} ({usuario.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Rol en Proyecto *
              </label>
              <select
                value={rol_en_proyecto}
                onChange={(e) => setRol_en_proyecto(e.target.value)}
                className="input-base"
              >
                <option value="miembro">Miembro</option>
                <option value="lider">Líder</option>
                <option value="observador">Observador</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full">
              Asignar Usuario
            </button>
          </form>

          <div className="mt-6 bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-medium">ℹ️ Info:</span> Los usuarios asignados podrán ver este proyecto y registrar tareas en las actividades asignadas.
            </p>
          </div>
        </div>

        {/* Usuarios Asignados */}
        <div className="card-base p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Usuarios Asignados ({asignados.length})
          </h2>

          {asignados.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No hay usuarios asignados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {asignados.map((asignado) => (
                <div
                  key={asignado.usuario_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                      {asignado.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{asignado.nombre}</p>
                      <p className="text-xs text-slate-500 capitalize">{asignado.rol_en_proyecto}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDesasignar(asignado.usuario_id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Desasignar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
