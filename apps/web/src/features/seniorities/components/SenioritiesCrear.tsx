import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { senioritiesService } from '../../../services/seniorities.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateSeniorityInput } from '@shared';

export default function AdminSenioritiesCrear() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateSeniorityInput>({
    nombre: '',
    nivel_orden: 0,
    activo: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSeniorityInput) => senioritiesService.create(data),
    onSuccess: () => {
      toast.success('Seniority creado exitosamente');
      navigate(buildPath('/admin/seniorities'));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear seniority');
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
        title="Nuevo Seniority"
        description="Crea un nuevo nivel de seniority"
        backLink={
          <Link to={buildPath('/admin/seniorities')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Seniority</CardTitle>
          <CardDescription>
            Completa los datos del seniority. Los campos marcados con * son obligatorios.
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Seniority'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate(buildPath('/admin/seniorities'))}
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
