import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';

export default function DetalleUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    setLoading(true);
    try {
      const response = await usuariosService.obtener(id);
      setUsuario(response.usuario);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    setDeleting(true);
    try {
      await usuariosService.eliminar(id, motivo);
      setShowDeleteModal(false);
      navigate('/admin/team');
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setDeleting(false);
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

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Usuario no encontrado</p>
        <Link to="/admin/team" className="btn-primary mt-4 inline-block">
          Volver a team members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/team" className="text-slate-400 hover:text-slate-600">
            ←
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{usuario.nombre}</h1>
              <p className="text-slate-600">{usuario.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/admin/team/${id}/editar`} className="btn-secondary">
            ✏️ Editar
          </Link>
          <button onClick={() => setShowDeleteModal(true)} className="btn-secondary text-red-600 hover:bg-red-50">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Perfil */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <p className="text-sm text-slate-600">Perfil</p>
              <p className="text-lg font-bold text-slate-900">
                {usuario.perfil_en_proyecto || 'Sin asignar'}
              </p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
              usuario.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {usuario.activo ? '✅' : '⏸️'}
            </div>
            <div>
              <p className="text-sm text-slate-600">Estado</p>
              <p className="text-lg font-bold text-slate-900">
                {usuario.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
        </div>

        {/* Email Verificado */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
              usuario.email_verificado ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {usuario.email_verificado ? '📧' : '⏳'}
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="text-lg font-bold text-slate-900">
                {usuario.email_verificado ? 'Verificado' : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>

        {/* Cambiar Password */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xl">
              🔑
            </div>
            <div>
              <p className="text-sm text-slate-600">Contraseña</p>
              <p className="text-lg font-bold text-slate-900">
                {usuario.debe_cambiar_password ? 'Temporal' : 'Fija'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Información Detallada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-600">Nombre completo</label>
            <p className="text-base font-medium text-slate-900 mt-1">{usuario.nombre}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <p className="text-base font-medium text-slate-900 mt-1">{usuario.email}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Creado por</label>
            <p className="text-base font-medium text-slate-900 mt-1">
              {usuario.creado_por_nombre || 'Auto-registro'}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Fecha de creación</label>
            <p className="text-base font-medium text-slate-900 mt-1 data-number">
              {new Date(usuario.fecha_creacion).toLocaleString('es-ES')}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Último login</label>
            <p className="text-base font-medium text-slate-900 mt-1 data-number">
              {usuario.ultimo_login 
                ? new Date(usuario.ultimo_login).toLocaleString('es-ES')
                : 'Nunca'}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Último cambio de password</label>
            <p className="text-base font-medium text-slate-900 mt-1 data-number">
              {usuario.ultima_fecha_cambio_password
                ? new Date(usuario.ultima_fecha_cambio_password).toLocaleString('es-ES')
                : 'Nunca'}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones Adicionales */}
      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones Adicionales</h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary">
            🔑 Cambiar Contraseña
          </button>
          <button className="btn-secondary">
            📧 Reenviar Email de Verificación
          </button>
          <button className="btn-secondary">
            📊 Ver Estadísticas
          </button>
        </div>
      </div>

      {/* Modal de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-base p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ⚠️ Eliminar Usuario
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Estás seguro de eliminar a <strong>{usuario.nombre}</strong>?
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Esta acción:</strong>
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                <li>Desactivará su cuenta inmediatamente</li>
                <li>El usuario no podrá iniciar sesión</li>
                <li>Los datos se conservarán por 30 días</li>
                <li>Podrás recuperarlo durante este período</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Motivo (opcional)
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="input-base min-h-[80px]"
                placeholder="Ej: El usuario ya no trabaja en el proyecto..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEliminar}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
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
