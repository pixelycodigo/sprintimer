import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ListTodo } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { talentDashboardService } from '../../../services/talent-dashboard.service';
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

export default function TalentTareasCrear() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    actividad_id: '',
    nombre: '',
    descripcion: '',
    horas_registradas: '0',
  });

  const { data: actividades, isLoading: loadingActividades } = useQuery({
    queryKey: ['talent-actividades'],
    queryFn: talentDashboardService.getActividades,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => talentDashboardService.createTarea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-tareas'] });
      toast.success('Tarea creada exitosamente');
      navigate('/talent/tareas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear tarea');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.actividad_id || !formData.nombre) {
      toast.error('La actividad y el nombre son requeridos');
      return;
    }

    createMutation.mutate({
      actividad_id: Number(formData.actividad_id),
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      horas_registradas: Number(formData.horas_registradas) || 0,
    });
  };

  if (loadingActividades) {
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
        title="Nueva Tarea"
        description="Crea una nueva tarea en una actividad asignada"
        backLink={
          <Link
            to="/talent/tareas"
            className="inline-flex items-center justify-center p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Tarea</CardTitle>
          <CardDescription>
            Completa los datos de la tarea. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actividades && actividades.length > 0 ? (
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
                      {actividades.map((actividad: any) => (
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Tarea'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => navigate('/talent/tareas')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-zinc-400">
                No tienes actividades asignadas para crear tareas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
