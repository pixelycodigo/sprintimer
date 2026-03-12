import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { asignacionesService } from '../../../services/asignaciones.service';
import { actividadesService } from '../../../services/actividades.service';
import { talentsService } from '../../../services/talents.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateAsignacionInput } from '@shared';

export default function AdminAsignacionesCrear() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAsignacionInput>({
    actividad_id: 0,
    talent_id: 0,
    fecha_asignacion: new Date().toISOString(),
    activo: true,
  });

  // Fetch actividades para el select
  const { data: actividades } = useQuery({
    queryKey: ['actividades'],
    queryFn: actividadesService.findAll,
  });

  // Fetch talents para el select
  const { data: talents } = useQuery({
    queryKey: ['talents'],
    queryFn: talentsService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAsignacionInput) => asignacionesService.create(data),
    onSuccess: () => {
      toast.success('Asignación creada exitosamente');
      navigate(buildPath('/admin/asignaciones'));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear asignación');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Nueva Asignación"
        description="Asigna un talent a una actividad"
        backLink={
          <Link to={buildPath('/admin/asignaciones')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Asignación</CardTitle>
          <CardDescription>
            Completa los datos de la asignación. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información de la Asignación
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actividad_id" variant="required">Actividad</Label>
                  <Select
                    value={formData.actividad_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, actividad_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      {actividades?.map((actividad) => (
                        <SelectItem key={actividad.id} value={actividad.id.toString()}>
                          {actividad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="talent_id" variant="required">Talent</Label>
                  <Select
                    value={formData.talent_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, talent_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar talent" />
                    </SelectTrigger>
                    <SelectContent>
                      {talents?.filter(t => t.activo).map((talent) => (
                        <SelectItem key={talent.id} value={talent.id.toString()}>
                          {talent.nombre_completo} {talent.apellido} - {talent.perfil_nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                Asignación activa
              </Label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Button
                type="submit"
                variant="default"
                size="default"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Asignación'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate(buildPath('/admin/asignaciones'))}
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
