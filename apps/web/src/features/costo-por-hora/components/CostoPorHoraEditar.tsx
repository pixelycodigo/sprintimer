import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costoPorHoraService } from '../../../services/costoPorHora.service';
import { divisasService } from '../../../services/divisas.service';
import { perfilesService } from '../../../services/perfiles.service';
import { senioritiesService } from '../../../services/seniorities.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Textarea } from '@ui/Textarea';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateCostoPorHoraInput } from '@shared';

export default function AdminCostoPorHoraEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateCostoPorHoraInput>({
    tipo: 'fijo',
    costo_min: undefined,
    costo_max: undefined,
    costo_hora: 0,
    divisa_id: undefined,
    perfil_id: undefined,
    seniority_id: undefined,
    concepto: '',
    activo: true,
  });

  // Fetch costo por hora
  const { data: costo, isLoading: isLoadingCosto } = useQuery({
    queryKey: ['costoPorHora', id],
    queryFn: () => costoPorHoraService.findById(Number(id)),
    enabled: !!id,
  });

  // Fetch divisas para el select
  const { data: divisas } = useQuery({
    queryKey: ['divisas'],
    queryFn: divisasService.findAll,
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
    mutationFn: (data: UpdateCostoPorHoraInput) => costoPorHoraService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Costo por hora actualizado exitosamente');
      navigate(buildPath('/admin/costo-por-hora'));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar costo por hora');
    },
  });

  useEffect(() => {
    if (costo) {
      setFormData({
        tipo: costo.tipo,
        costo_min: costo.costo_min || undefined,
        costo_max: costo.costo_max || undefined,
        costo_hora: costo.costo_hora,
        divisa_id: costo.divisa_id,
        perfil_id: costo.perfil_id,
        seniority_id: costo.seniority_id,
        concepto: costo.concepto || '',
        activo: costo.activo,
      });
    }
  }, [costo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoadingCosto) {
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
        title="Editar Costo por Hora"
        description="Actualiza la información del costo por hora"
        backLink={
          <Link to={buildPath('/admin/costo-por-hora')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Costo por Hora</CardTitle>
          <CardDescription>
            Actualiza los datos del costo por hora. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo" variant="required">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'fijo' | 'variable') => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fijo">Fijo</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="divisa_id" variant="required">Divisa</Label>
                    <Select
                      value={formData.divisa_id?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, divisa_id: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar divisa" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisas?.map((divisa) => (
                          <SelectItem key={divisa.id} value={divisa.id.toString()}>
                            {divisa.simbolo} - {divisa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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

                {formData.tipo === 'variable' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="costo_min" variant="required">Costo Mínimo</Label>
                      <Input
                        id="costo_min"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.costo_min || ''}
                        onChange={(e) => setFormData({ ...formData, costo_min: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="costo_max" variant="required">Costo Máximo</Label>
                      <Input
                        id="costo_max"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.costo_max || ''}
                        onChange={(e) => setFormData({ ...formData, costo_max: Number(e.target.value) })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="costo_hora" variant="required">Costo por Hora</Label>
                    <Input
                      id="costo_hora"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.costo_hora}
                      onChange={(e) => setFormData({ ...formData, costo_hora: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="concepto">Concepto</Label>
                  <Textarea
                    id="concepto"
                    value={formData.concepto || ''}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    placeholder="Descripción del costo por hora"
                    className="min-h-[80px]"
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
                Costo por hora activo
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
                onClick={() => navigate(buildPath('/admin/costo-por-hora'))}
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
