import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usuariosService } from '../../../services/usuariosService';
import { perfilesTeamService } from '../../../services/perfilesTeamService';
import { costosService } from '../../../services/costosService';
import { senioritiesService } from '../../../services/senioritiesService';

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [costos, setCostos] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [costosFiltrados, setCostosFiltrados] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: '1', // team_member por defecto
    es_temporal: true,
    perfil_team_id: '',
    seniority_id: '',
    costo_por_hora_id: '',
    costo_hora_personalizado: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [perfilesRes, costosRes, senioritiesRes] = await Promise.all([
        perfilesTeamService.listar({ activo: true }),
        costosService.listar(),
        senioritiesService.listar({})  // Sin filtro activo para mostrar todos
      ]);
      setPerfiles(perfilesRes.perfiles || []);
      setCostos(costosRes.costos || []);
      setSeniorities(senioritiesRes.seniorities || []);
      setCostosFiltrados(costosRes.costos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  // Filtrar costos cuando cambia el seniority
  useEffect(() => {
    if (formData.seniority_id) {
      // Filtrar costos por seniority seleccionado o costos globales (sin seniority)
      const filtrados = costos.filter(costo => 
        !costo.seniority_id || costo.seniority_id === parseInt(formData.seniority_id)
      );
      setCostosFiltrados(filtrados);
    } else {
      // Si no hay seniority, mostrar solo costos globales (sin seniority)
      const globales = costos.filter(costo => !costo.seniority_id);
      setCostosFiltrados(globales);
    }
  }, [formData.seniority_id, costos]);

  // Verificar si hay costos asociados al seniority seleccionado
  const hayCostosAsociados = formData.seniority_id && costosFiltrados.some(c => 
    c.seniority_id === parseInt(formData.seniority_id)
  );
  const senioritySeleccionado = seniorities.find(s => s.id === parseInt(formData.seniority_id));
  
  // Obtener costo seleccionado para validar rango
  const costoSeleccionado = costosFiltrados.find(c => c.id === parseInt(formData.costo_por_hora_id));
  const esCostoVariable = costoSeleccionado?.tipo === 'variable';
  
  // Validar monto personalizado
  const montoValido = !esCostoVariable || !formData.costo_hora_personalizado || (
    parseFloat(formData.costo_hora_personalizado) >= parseFloat(costoSeleccionado.costo_min) &&
    parseFloat(formData.costo_hora_personalizado) <= parseFloat(costoSeleccionado.costo_max)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validar monto personalizado si el costo es variable
    if (esCostoVariable && formData.costo_hora_personalizado) {
      const monto = parseFloat(formData.costo_hora_personalizado);
      const min = parseFloat(costoSeleccionado.costo_min);
      const max = parseFloat(costoSeleccionado.costo_max);
      
      if (monto < min || monto > max) {
        setError(`El monto debe estar entre ${min} y ${max} ${costoSeleccionado.moneda_codigo}`);
        setLoading(false);
        return;
      }
    }

    try {
      await usuariosService.crear(formData);
      setSuccess('Integrante creado exitosamente');

      setTimeout(() => {
        navigate('/admin/team');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear integrante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/team" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Integrante</h1>
          <p className="text-slate-600 mt-1">Registra un nuevo integrante para tu equipo</p>
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

      {/* Form */}
      <div className="card-base p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input-base"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base"
              placeholder="juan@empresa.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-base"
              placeholder="••••••••"
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-1">
              Mínimo 8 caracteres
            </p>
          </div>

          {/* Tipo de Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de contraseña *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="es_temporal"
                  checked={formData.es_temporal === true}
                  onChange={(e) => setFormData({ ...formData, es_temporal: e.target.value === 'true' })}
                  value="true"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Temporal</strong> - El integrante deberá cambiarla en el primer inicio de sesión
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="es_temporal"
                  checked={formData.es_temporal === false}
                  onChange={(e) => setFormData({ ...formData, es_temporal: e.target.value === 'true' })}
                  value="false"
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-700">
                  <strong>Fija</strong> - La contraseña establecida será permanente
                </span>
              </label>
            </div>
          </div>

          {/* Perfil, Seniority y Costo por Hora */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Perfil */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Perfil del Integrante *
                </label>
                <select
                  value={formData.perfil_team_id}
                  onChange={(e) => setFormData({ ...formData, perfil_team_id: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Seleccionar perfil...</option>
                  {perfiles.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.nombre.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Perfil funcional que tendrá el integrante
                </p>
              </div>

              {/* Seniority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Seniority *
                </label>
                <select
                  value={formData.seniority_id}
                  onChange={(e) => setFormData({ ...formData, seniority_id: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Seleccionar seniority...</option>
                  {seniorities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} - {s.descripcion?.substring(0, 50)}...
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Nivel de experiencia del integrante
                </p>
              </div>
            </div>

            {/* Costo por Hora */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Costo por Hora *
              </label>
              <select
                value={formData.costo_por_hora_id}
                onChange={(e) => {
                  setFormData({ ...formData, costo_por_hora_id: e.target.value, costo_hora_personalizado: '' });
                }}
                className="input-base"
                disabled={!formData.seniority_id}
              >
                <option value="">
                  {!formData.seniority_id 
                    ? 'Selecciona un seniority primero' 
                    : hayCostosAsociados 
                      ? 'Seleccionar costo...' 
                      : 'No hay costos disponibles'}
                </option>
                {hayCostosAsociados && costosFiltrados.filter(c => !c.en_uso).map((costo) => (
                  <option key={costo.id} value={costo.id}>
                    {costo.tipo === 'fijo'
                      ? `${costo.costo_hora} ${costo.moneda_codigo}/hora`
                      : `${costo.costo_min} - ${costo.costo_max} ${costo.moneda_codigo}/hora (variable)`
                    }
                    {costo.concepto ? ` - ${costo.concepto}` : ''}
                  </option>
                ))}
              </select>
              
              {/* Input personalizado para costos variables */}
              {esCostoVariable && costoSeleccionado && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium text-blue-900 mb-1.5">
                    Monto Personalizado ({costoSeleccionado.moneda_codigo})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={costoSeleccionado.costo_min}
                    max={costoSeleccionado.costo_max}
                    value={formData.costo_hora_personalizado}
                    onChange={(e) => setFormData({ ...formData, costo_hora_personalizado: e.target.value })}
                    className="input-base border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={`Ingresa un monto entre ${costoSeleccionado.costo_min} y ${costoSeleccionado.costo_max}`}
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    💡 Rango permitido: {costoSeleccionado.costo_min} - {costoSeleccionado.costo_max} {costoSeleccionado.moneda_codigo}
                  </p>
                  {formData.costo_hora_personalizado && !montoValido && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ El monto debe estar dentro del rango permitido
                    </p>
                  )}
                  {formData.costo_hora_personalizado && montoValido && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      ✅ Monto válido
                    </p>
                  )}
                </div>
              )}
              
              {!formData.seniority_id && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Debes seleccionar un seniority para asignar costo
                </p>
              )}
              {formData.seniority_id && !hayCostosAsociados && (
                <p className="text-xs text-red-600 mt-1">
                  ❌ No hay costos de hora asociados a este seniority. Debes crear un costo de hora y asociarlo al seniority '{senioritySeleccionado?.nombre}' en la página de Costos por Hora.
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Costo por hora que se asignará al integrante
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Información:</strong> Al crear un integrante del equipo, se le asigna el rol
              <strong> team_member</strong>, un perfil funcional y un costo por hora. Estos pueden
              actualizarse posteriormente desde la edición del integrante.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creando...' : 'Crear Integrante'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/team')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
