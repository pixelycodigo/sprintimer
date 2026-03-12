import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../../services/usuarios.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Card, CardContent } from '@ui/Card';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { HeaderPage } from '@ui/HeaderPage';

interface CreateUsuarioForm {
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  password_confirm: string;
  rol_id: number;
}

export default function SuperAdminUsuariosCrear() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUsuarioForm>({
    nombre: '',
    usuario: '',
    email: '',
    password: '',
    password_confirm: '',
    rol_id: 2, // Administrador por defecto
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateUsuarioForm, 'password_confirm'>) =>
      usuariosService.create({
        nombre: data.nombre,
        usuario: data.usuario,
        email: data.email,
        password: data.password,
        rol_id: data.rol_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosService.queryKeys.all() });
      toast.success('Usuario creado exitosamente');
      navigate(buildPath('/super-admin/usuarios'));
    },
    onError: (error: any) => {
      // Mostrar mensaje específico del error de validación
      if (error.response?.data?.issues) {
        const issues = error.response.data.issues;
        
        // Agrupar errores por campo para mostrar mensaje claro
        const passwordErrors = issues
          .filter((issue: any) => issue.field === 'password')
          .map((issue: any) => issue.message);
        
        const confirmErrors = issues
          .filter((issue: any) => issue.field === 'password_confirm')
          .map((issue: any) => issue.message);
        
        const otherErrors = issues
          .filter((issue: any) => !['password', 'password_confirm'].includes(issue.field))
          .map((issue: any) => issue.message);
        
        // Mostrar errores de contraseña primero (los más importantes)
        if (passwordErrors.length > 0) {
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">❌ Error en la contraseña:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {passwordErrors.map((msg: string, i: number) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>,
            { duration: 8000 }
          );
        }
        
        if (confirmErrors.length > 0) {
          toast.error(confirmErrors.join('\n'), { duration: 5000 });
        }
        
        if (otherErrors.length > 0) {
          toast.error(otherErrors.join('\n'), { duration: 5000 });
        }
      } else {
        toast.error(error.message || 'Error al crear usuario');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos antes de enviar
    const errors: string[] = [];
    
    if (!formData.nombre || formData.nombre.trim() === '') {
      errors.push('El nombre completo es requerido');
    }
    if (!formData.usuario || formData.usuario.trim() === '') {
      errors.push('El usuario es requerido');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.usuario)) {
      errors.push('El usuario solo puede contener letras, números y guiones bajos');
    }
    if (!formData.email || formData.email.trim() === '') {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido');
    }
    if (!formData.password || formData.password.length === 0) {
      errors.push('La contraseña es requerida');
    } else {
      // Validar requisitos de contraseña
      if (formData.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula (A-Z)');
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula (a-z)');
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos un número (0-9)');
      }
    }
    if (!formData.password_confirm || formData.password_confirm.length === 0) {
      errors.push('La confirmación de contraseña es requerida');
    } else if (formData.password !== formData.password_confirm) {
      errors.push('Las contraseñas no coinciden');
    }
    
    // Si hay errores, mostrar en toast y no enviar
    if (errors.length > 0) {
      toast.error(
        <div className="space-y-2">
          <p className="font-semibold">❌ Campos requeridos:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {errors.map((msg: string, i: number) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>,
        { duration: 10000 }
      );
      return;
    }
    
    createMutation.mutate({
      nombre: formData.nombre,
      usuario: formData.usuario,
      email: formData.email,
      password: formData.password,
      rol_id: formData.rol_id,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Nuevo Usuario"
        description="Crea un nuevo usuario administrador"
        backLink={
          <Link to={buildPath('/super-admin/usuarios')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card className="dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nombre Completo */}
            <div>
              <Label htmlFor="nombre">
                Nombre completo *
              </Label>
              <Input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Juan Pérez"
              />
            </div>

            {/* Usuario */}
            <div>
              <Label htmlFor="usuario">
                Usuario *
              </Label>
              <Input
                id="usuario"
                type="text"
                required
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="juanperez"
                pattern="[a-zA-Z0-9_]+"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Solo letras, números y guiones bajos
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="juan@email.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <Label htmlFor="password">
                Contraseña *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Mínimo 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <Label htmlFor="password_confirm">
                Confirmar contraseña *
              </Label>
              <div className="relative">
                <Input
                  id="password_confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  className="pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Debe coincidir con la contraseña anterior
              </p>
            </div>

            {/* Tipo de Rol */}
            <div>
              <Label htmlFor="rol_id">
                Tipo de usuario *
              </Label>
              <select
                id="rol_id"
                value={formData.rol_id}
                onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus-visible:ring-zinc-300"
              >
                <option value="2">Administrador</option>
                <option value="1">Super Admin</option>
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Los administradores pueden gestionar clientes, proyectos y talents
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
              </Button>
              <Link to={buildPath('/super-admin/usuarios')}>
                <Button type="button" variant="secondary" size="default">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
