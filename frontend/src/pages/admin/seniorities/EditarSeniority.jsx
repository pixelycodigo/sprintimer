import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { senioritiesService } from '../../../services/senioritiesService';

// Paleta de colores pasteles de Tailwind CSS
// Colores neutros (400) y colores pasteles (200)
const colorPalette = [
  { name: 'Slate', value: '#94A3B8' },     // 400
  { name: 'Gray', value: '#9CA3AF' },      // 400
  { name: 'Zinc', value: '#A1A1AA' },      // 400
  { name: 'Neutral', value: '#A3A3A3' },   // 400
  { name: 'Stone', value: '#A8A29E' },     // 400
  { name: 'Taupe', value: '#8B8B83' },     // 400
  { name: 'Mauve', value: '#9D8FA3' },     // 400
  { name: 'Mist', value: '#8A9A8F' },      // 400
  { name: 'Olive', value: '#94985E' },     // 400
  { name: 'Red', value: '#FECACA' },       // 200
  { name: 'Orange', value: '#FED7AA' },    // 200
  { name: 'Amber', value: '#FDE68A' },     // 200
  { name: 'Yellow', value: '#FEF08A' },    // 200
  { name: 'Lime', value: '#D9F99D' },      // 200
  { name: 'Green', value: '#BBF7D0' },     // 200
  { name: 'Emerald', value: '#A7F3D0' },   // 200
  { name: 'Teal', value: '#99F6E4' },      // 200
  { name: 'Cyan', value: '#A5F3FC' },      // 200
  { name: 'Sky', value: '#BAE6FD' },       // 200
  { name: 'Blue', value: '#BFDBFE' },      // 200
  { name: 'Indigo', value: '#C7D2FE' },    // 200
  { name: 'Violet', value: '#DDD6FE' },    // 200
  { name: 'Purple', value: '#E9D5FF' },    // 200
  { name: 'Fuchsia', value: '#F5D0FE' },   // 200
  { name: 'Pink', value: '#FBCFE8' },      // 200
  { name: 'Rose', value: '#FECDD3' },      // 200
];

export default function EditarSeniority() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seniority, setSeniority] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: '',
    color: '#3B82F6',
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const seniorityRes = await senioritiesService.obtener(id);
      const seniorityData = seniorityRes.seniority;
      setSeniority(seniorityData);
      setFormData({
        nombre: seniorityData.nombre,
        descripcion: seniorityData.descripcion || '',
        orden: seniorityData.orden.toString(),
        color: seniorityData.color || '#3B82F6',
        activo: seniorityData.activo,
      });
    } catch (error) {
      console.error('Error al cargar seniority:', error);
      setError('Error al cargar seniority');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.orden) {
      setError('Nombre y orden son requeridos');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await senioritiesService.actualizar(id, {
        ...formData,
        orden: parseInt(formData.orden),
      });
      setSuccess('Seniority actualizado exitosamente');
      setTimeout(() => {
        navigate('/admin/seniorities');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar seniority');
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/seniorities" className="text-slate-400 hover:text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Seniority</h1>
          <p className="text-slate-600 mt-1">
            Actualiza la información del seniority
          </p>
        </div>
      </div>

      {/* Alertas */}
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

      {/* Formulario */}
      <div className="card-base p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre del Seniority *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="input-base"
                placeholder="Ej: Junior, Senior, Lead"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="input-base"
                placeholder="Descripción del nivel de experiencia"
                rows="3"
              />
            </div>
          </div>

          {/* Configuración */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nivel */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nivel *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                  className="input-base"
                  placeholder="Ej: 1, 2, 3..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  1 = menor, 5 = mayor
                </p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-base flex-1"
                  >
                    {colorPalette.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name} Pastel
                      </option>
                    ))}
                  </select>
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-slate-300 shadow-sm"
                    style={{ backgroundColor: formData.color }}
                    title={colorPalette.find(c => c.value === formData.color)?.name}
                  ></div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/seniorities')}
              className="btn-secondary"
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Información:</strong> Los cambios se reflejarán inmediatamente en todos los miembros que tengan este seniority asignado.
        </p>
      </div>
    </div>
  );
}
