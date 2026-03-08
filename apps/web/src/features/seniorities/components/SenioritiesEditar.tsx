import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { senioritiesService } from '../../../services/seniorities.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Spinner } from '@ui/Spinner';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateSeniorityInput } from '@shared';

export default function AdminSenioritiesEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateSeniorityInput>({
    nombre: '',
    nivel_orden: 0,
    activo: true,
  });

  // Fetch seniority
  const { data: seniority, isLoading: isLoadingSeniority } = useQuery({
    queryKey: ['seniority', id],
    queryFn: () => senioritiesService.findById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateSeniorityInput) => senioritiesService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Seniority actualizado exitosamente');
      navigate('/admin/seniorities');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar seniority');
    },
  });

  useEffect(() => {
    if (seniority) {
      setFormData({
        nombre: seniority.nombre,
        nivel_orden: seniority.nivel_orden,
        activo: seniority.activo,
      });
    }
  }, [seniority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoadingSeniority) {
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
        title="Editar Seniority"
        description="Actualiza la información del seniority"
        backLink={
          <Link
            to="/admin/seniorities"
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Seniority</CardTitle>
          <CardDescription>
            Actualiza los datos del seniority. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div>
                <Label htmlFor="nombre" variant="required">Nombre</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Senior"
                />
              </div>

              <div>
                <Label htmlFor="nivel_orden" variant="required">Nivel (Orden)</Label>
                <Input
                  id="nivel_orden"
                  type="number"
                  required
                  min="0"
                  value={formData.nivel_orden}
                  onChange={(e) => setFormData({ ...formData, nivel_orden: Number(e.target.value) })}
                  placeholder="1"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Número para ordenar los seniorities (0 = más bajo, mayor número = más alto)
                </p>
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
                Seniority activo
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
                onClick={() => navigate('/admin/seniorities')}
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
