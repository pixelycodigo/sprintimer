import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../services/usuarios.service';
import { Button } from '../../components/ui/Button';

interface CreateUsuarioForm {
  nombre_completo: string;
  usuario: string;
  email: string;
  password: string;
  password_confirm: string;
  rol_id: number;
}

export default function SuperAdminUsuariosCrear() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioForm>({
    nombre_completo: '',
    usuario: '',
    email: '',
    password: '',
    password_confirm: '',
    rol_id: 2, // Administrador por defecto
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateUsuarioForm, 'password_confirm'>) => 
      usuariosService.create({
        nombre_completo: data.nombre_completo,
        usuario: data.usuario,
        email: data.email,
        password: data.password,
        rol_id: data.rol_id,
      }),
    onSuccess: () => {
      toast.success('Usuario creado exitosamente');
      navigate('/super-admin/usuarios');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    createMutation.mutate({
      nombre_completo: formData.nombre_completo,
      usuario: formData.usuario,
      email: formData.email,
      password: formData.password,
      rol_id: formData.rol_id,
      password_confirm: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/super-admin/usuarios"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Usuario</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crea un nuevo usuario administrador
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nombre Completo */}
            <div>
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre completo *
              </label>
              <input
                id="nombre_completo"
                type="text"
                required
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                className="input"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Usuario */}
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-slate-700 mb-1.5">
                Usuario *
              </label>
              <input
                id="usuario"
                type="text"
                required
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                className="input"
                placeholder="juanperez"
                pattern="[a-zA-Z0-9_]+"
              />
              <p className="mt-1 text-xs text-slate-500">
                Solo letras, números y guiones bajos
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="juan@email.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Mínimo 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar contraseña *
              </label>
              <input
                id="password_confirm"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {/* Tipo de Rol */}
            <div>
              <label htmlFor="rol_id" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tipo de contraseña *
              </label>
              <select
                id="rol_id"
                value={formData.rol_id}
                onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                className="input"
              >
                <option value="2">Administrador</option>
                <option value="1">Super Admin</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Los administradores pueden gestionar clientes, proyectos y talents
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                size="md"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
              </Button>
              <Link to="/super-admin/usuarios">
                <Button type="button" variant="secondary" size="md">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
