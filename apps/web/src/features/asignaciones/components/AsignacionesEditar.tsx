import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { asignacionesService } from '../../../services/asignaciones.service';
import { actividadesService } from '../../../services/actividades.service';
import { talentsService } from '../../../services/talents.service';
import { Button } from '@ui/Button';
import { Spinner } from '@ui/Spinner';
import { Label } from '@ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateAsignacionInput } from '@shared';

export default function AdminAsignacionesEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateAsignacionInput>({
    actividad_id: undefined,
    talent_id: undefined,
  });

  // Fetch asignacion
  const { data: asignacion, isLoading: isLoadingAsignacion } = useQuery({
    queryKey: ['asignacion', id],
    queryFn: () => asignacionesService.findById(Number(id)),
    enabled: !!id,
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateAsignacionInput) => asignacionesService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Asignación actualizada exitosamente');
      navigate('/admin/asignaciones');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar asignación');
    },
  });

  useEffect(() => {
    if (asignacion) {
      setFormData({
        actividad_id: asignacion.actividad_id,
        talent_id: asignacion.talent_id,
      });
    }
  }, [asignacion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoadingAsignacion) {
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
        title="Editar Asignación"
        description="Actualiza la información de la asignación"
        backLink={
          <Link
            to="/admin/asignaciones"
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Asignación</CardTitle>
          <CardDescription>
            Actualiza los datos de la asignación. Los campos marcados con * son obligatorios.
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
                    value={formData.actividad_id?.toString()}
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
                    value={formData.talent_id?.toString()}
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
                onClick={() => navigate('/admin/asignaciones')}
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
