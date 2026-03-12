import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ListTodo } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentDashboardService } from '../../../services/talent-dashboard.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Textarea } from '@ui/Textarea';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/Select';

export default function TalentTareasEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    actividad_id: '',
    nombre: '',
    descripcion: '',
    horas_registradas: '0',
  });

  // Fetch tarea
  const { data: tarea, isLoading: isLoadingTarea } = useQuery({
    queryKey: ['talent-tarea', id],
    queryFn: async () => {
      const tareas = await talentDashboardService.getTareas();
      return tareas.find((t: any) => t.id === Number(id));
    },
    enabled: !!id,
  });

  // Fetch actividades
  const { data: actividades } = useQuery({
    queryKey: ['talent-actividades'],
    queryFn: talentDashboardService.getActividades,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await talentDashboardService.updateTarea(Number(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-tareas'] });
      toast.success('Tarea actualizada exitosamente');
      navigate(buildPath('/talent/tareas'));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar tarea');
    },
  });

  useEffect(() => {
    if (tarea) {
      setFormData({
        actividad_id: String(tarea.actividad_id || ''),
        nombre: tarea.nombre,
        descripcion: tarea.descripcion || '',
        horas_registradas: String(tarea.horas_registradas || 0),
      });
    }
  }, [tarea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.actividad_id || !formData.nombre) {
      toast.error('La actividad y el nombre son requeridos');
      return;
    }

    // Actualizar tarea con todos los campos
    updateMutation.mutate({
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      horas_registradas: Number(formData.horas_registradas) || 0,
    });
  };

  if (isLoadingTarea) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tarea) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-zinc-400">Tarea no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Editar Tarea"
        description="Actualiza la información de la tarea"
        backLink={
          <Link to={buildPath('/talent/tareas')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Tarea</CardTitle>
          <CardDescription>
            Actualiza los datos de la tarea. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <ListTodo className="w-5 h-5" />
                Información Básica
              </h3>

              <div>
                <Label htmlFor="actividad_id" variant="required">Actividad</Label>
                <Select
                  value={formData.actividad_id}
                  onValueChange={(value) => setFormData({ ...formData, actividad_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {actividades?.map((actividad: any) => (
                      <SelectItem key={actividad.id} value={String(actividad.id)}>
                        {actividad.nombre} ({actividad.proyecto})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nombre" variant="required">Nombre de la Tarea</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Revisión de código"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe la tarea..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="horas_registradas">Horas Registradas</Label>
                <Input
                  id="horas_registradas"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.horas_registradas}
                  onChange={(e) => setFormData({ ...formData, horas_registradas: e.target.value })}
                  placeholder="0"
                />
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
                onClick={() => navigate(buildPath('/talent/tareas'))}
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
