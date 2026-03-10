import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../../services/usuarios.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateUsuarioInput } from '@shared';

interface UpdateUsuarioForm extends UpdateUsuarioInput {
  password?: string;
  password_confirm?: string;
}

export default function SuperAdminUsuariosEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();  // Agregar queryClient
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UpdateUsuarioForm>({
    nombre: '',
    email: '',
    activo: true,
    password: '',
    password_confirm: '',
  });

  // Fetch usuario
  const { data: usuario, isLoading: isLoadingUsuario } = useQuery({
    queryKey: usuariosService.queryKeys.byId(Number(id)),
    queryFn: () => usuariosService.findById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUsuarioForm) => usuariosService.update(Number(id), data),
    onSuccess: () => {
      // Invalidar caché de usuarios para que se actualice la tabla
      queryClient.invalidateQueries({ queryKey: usuariosService.queryKeys.all() });
      queryClient.invalidateQueries({ queryKey: usuariosService.queryKeys.byId(Number(id)) });
      toast.success('Usuario actualizado exitosamente');
      navigate('/super-admin/usuarios');
    },
    onError: (error: any) => {
      // Mostrar mensaje específico del error
      if (error.response?.data?.issues) {
        const issues = error.response.data.issues;
        const messages = issues.map((issue: any) => issue.message).join('\n');
        toast.error(messages);
      } else {
        toast.error(error.message || 'Error al actualizar usuario');
      }
    },
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        activo: Boolean(usuario.activo),  // Convertir a booleano
        password: '',
        password_confirm: '',
      });
    }
  }, [usuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo incluir password si el usuario lo completó
    const submitData: UpdateUsuarioForm = {
      nombre: formData.nombre,
      email: formData.email,
      activo: Boolean(formData.activo),
    };
    
    // Solo agregar password si fue modificado
    if (formData.password && formData.password.length > 0) {
      submitData.password = formData.password;
      submitData.password_confirm = formData.password_confirm;
    }
    
    updateMutation.mutate(submitData);
  };

  if (isLoadingUsuario) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Editar Usuario"
        description="Modificar información del usuario administrador"
        backLink={
          <Link to="/super-admin/usuarios">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form Card */}
      <Card className="dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            Actualiza la información del usuario administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nombre completo */}
            <div>
              <Label htmlFor="nombre">
                Nombre completo
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked as boolean })}
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Usuario activo
              </Label>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Los usuarios inactivos no pueden iniciar sesión
              </p>
            </div>

            {/* Contraseña */}
            <div>
              <Label htmlFor="password">
                Nueva contraseña (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Dejar vacío para no cambiar"
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
                Dejar vacío para mantener la contraseña actual
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <Label htmlFor="password_confirm">
                Confirmar nueva contraseña
              </Label>
              <Input
                id="password_confirm"
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                placeholder="Repetir contraseña"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Debe coincidir con la contraseña anterior
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Guardando cambios...
                  </span>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/super-admin/usuarios')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-slate-50 dark:bg-zinc-800/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
            <CardTitle className="text-base">Información Importante</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-slate-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
            <li>Para cambiar la contraseña, usa la opción "Cambiar contraseña" en el perfil del usuario</li>
            <li>Los cambios se aplicarán inmediatamente después de guardar</li>
            <li>El usuario recibirá una notificación por email si su estado cambia</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
