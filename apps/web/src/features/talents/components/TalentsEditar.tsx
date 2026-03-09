import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, GraduationCap, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentsService } from '../../../services/talents.service';
import { perfilesService } from '../../../services/perfiles.service';
import { senioritiesService } from '../../../services/seniorities.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Spinner } from '@ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateTalentInput } from '@shared';

export default function AdminTalentsEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateTalentInput>({
    usuario_id: undefined,
    perfil_id: undefined,
    seniority_id: undefined,
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    costo_hora_fijo: undefined,
    costo_hora_variable_min: undefined,
    costo_hora_variable_max: undefined,
    activo: true,
  });

  // Fetch talent
  const { data: talent, isLoading: isLoadingTalent } = useQuery({
    queryKey: ['talent', id],
    queryFn: () => talentsService.findById(Number(id)),
    enabled: !!id,
  });

  // Fetch perfiles para el select
  const { data: perfiles } = useQuery({
    queryKey: ['perfiles'],
    queryFn: perfilesService.findAll,
  });

  // Fetch seniorities para el select
  const { data: seniorities } = useQuery({
    queryKey: ['seniorities'],
    queryFn: senioritiesService.findAll,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTalentInput) => talentsService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Talent actualizado exitosamente');
      navigate('/admin/talents');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar talent');
    },
  });

  useEffect(() => {
    if (talent) {
      setFormData({
        usuario_id: talent.usuario_id || undefined,
        perfil_id: talent.perfil_id,
        seniority_id: talent.seniority_id,
        nombre: talent.nombre,
        apellido: talent.apellido,
        email: talent.email,
        password: '',
        costo_hora_fijo: talent.costo_hora_fijo || undefined,
        costo_hora_variable_min: talent.costo_hora_variable_min || undefined,
        costo_hora_variable_max: talent.costo_hora_variable_max || undefined,
        activo: talent.activo,
      });
    }
  }, [talent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoadingTalent) {
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
        title="Editar Talent"
        description="Actualiza la información del talent"
        backLink={
          <Link
            to="/admin/talents"
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Talent</CardTitle>
          <CardDescription>
            Actualiza los datos del talent. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre" variant="required">Nombre</Label>
                  <Input
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <Label htmlFor="apellido" variant="required">Apellido</Label>
                  <Input
                    id="apellido"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Pérez"
                  />
                </div>

                <div>
                  <Label htmlFor="email" variant="required">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña (dejar vacío para no cambiar)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Perfil y Seniority */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Perfil y Seniority
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="perfil_id" variant="required">Perfil</Label>
                  <Select
                    value={formData.perfil_id?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, perfil_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfiles?.map((perfil) => (
                        <SelectItem key={perfil.id} value={perfil.id.toString()}>
                          {perfil.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="seniority_id" variant="required">Seniority</Label>
                  <Select
                    value={formData.seniority_id?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, seniority_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar seniority" />
                    </SelectTrigger>
                    <SelectContent>
                      {seniorities?.map((seniority) => (
                        <SelectItem key={seniority.id} value={seniority.id.toString()}>
                          {seniority.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Costo por Hora */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Costo por Hora
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="costo_hora_fijo">Costo Fijo</Label>
                  <Input
                    id="costo_hora_fijo"
                    type="number"
                    value={formData.costo_hora_fijo || ''}
                    onChange={(e) => setFormData({ ...formData, costo_hora_fijo: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="costo_hora_variable_min">Costo Variable Mín</Label>
                  <Input
                    id="costo_hora_variable_min"
                    type="number"
                    value={formData.costo_hora_variable_min || ''}
                    onChange={(e) => setFormData({ ...formData, costo_hora_variable_min: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="costo_hora_variable_max">Costo Variable Máx</Label>
                  <Input
                    id="costo_hora_variable_max"
                    type="number"
                    value={formData.costo_hora_variable_max || ''}
                    onChange={(e) => setFormData({ ...formData, costo_hora_variable_max: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
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
                Talent activo
              </Label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate('/admin/talents')}
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
