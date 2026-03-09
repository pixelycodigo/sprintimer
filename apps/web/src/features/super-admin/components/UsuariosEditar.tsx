import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, User } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usuariosService } from '../../../services/usuarios.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import type { UpdateUsuarioInput } from '@shared';

export default function SuperAdminUsuariosEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateUsuarioInput>({
    nombre: '',
    email: '',
    activo: true,
  });

  // Fetch usuario
  const { data: usuario, isLoading: isLoadingUsuario } = useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuariosService.findById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUsuarioInput) => usuariosService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Usuario actualizado exitosamente');
      navigate('/super-admin/usuarios');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo,
      });
    }
  }, [usuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
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
            <div>
              <Label htmlFor="activo">
                Estado del usuario
              </Label>
              <Select
                value={formData.activo ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, activo: value === 'true' })}
              >
                <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Los usuarios inactivos no pueden iniciar sesión
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
