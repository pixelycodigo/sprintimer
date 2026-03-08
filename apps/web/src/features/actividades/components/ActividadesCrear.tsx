import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { actividadesService } from '../../../services/actividades.service';
import { proyectosService } from '../../../services/proyectos.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Textarea } from '@ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateActividadInput } from '@shared';

export default function AdminActividadesCrear() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateActividadInput>({
    proyecto_id: 0,
    sprint_id: undefined,
    nombre: '',
    descripcion: '',
    horas_estimadas: 0,
    activo: true,
  });

  // Fetch proyectos para el select
  const { data: proyectos } = useQuery({
    queryKey: ['proyectos'],
    queryFn: proyectosService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateActividadInput) => actividadesService.create(data),
    onSuccess: () => {
      toast.success('Actividad creada exitosamente');
      navigate('/admin/actividades');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear actividad');
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
        title="Nueva Actividad"
        description="Crea una nueva actividad para un proyecto"
        backLink={
          <Link
            to="/admin/actividades"
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Actividad</CardTitle>
          <CardDescription>
            Completa los datos de la actividad. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proyecto_id" variant="required">Proyecto</Label>
                  <Select
                    value={formData.proyecto_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, proyecto_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos?.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id.toString()}>
                          {proyecto.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nombre" variant="required">Nombre de la Actividad</Label>
                  <Input
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Desarrollo de módulo de autenticación"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada de la actividad"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="horas_estimadas" variant="required">Horas Estimadas</Label>
                  <Input
                    id="horas_estimadas"
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={formData.horas_estimadas}
                    onChange={(e) => setFormData({ ...formData, horas_estimadas: Number(e.target.value) })}
                    placeholder="8"
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
                Actividad activa
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
                {createMutation.isPending ? 'Creando...' : 'Crear Actividad'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate('/admin/actividades')}
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
