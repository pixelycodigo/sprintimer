import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, User as UserIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../../../services/auth.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { Badge } from '@ui/Badge';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';

export default function TalentPerfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch usuario actual
  const { data: usuario, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: authService.getMe,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { nombre?: string; email?: string }) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar perfil');
    },
  });

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
      });
    }
  }, [usuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
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
        title="Mi Perfil"
        description="Gestiona tu información personal"
        backLink={
          <Link
            to={buildPath('/talent')}
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Información del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Actualiza tu información personal y datos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <Label htmlFor="nombre" variant="required">Nombre Completo</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="pl-10"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" variant="required">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Rol (solo lectura) */}
            <div>
              <Label>Rol</Label>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <Badge variant="default" className="capitalize">
                  {usuario?.rol || 'talent'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Este campo no se puede modificar
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate(buildPath('/talent'))}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
