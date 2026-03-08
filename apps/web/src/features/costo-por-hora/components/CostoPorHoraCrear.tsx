import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { costoPorHoraService } from '../../../services/costoPorHora.service';
import { divisasService } from '../../../services/divisas.service';
import { perfilesService } from '../../../services/perfiles.service';
import { senioritiesService } from '../../../services/seniorities.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Textarea } from '@ui/Textarea';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateCostoPorHoraInput } from '@shared';

export default function AdminCostoPorHoraCrear() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateCostoPorHoraInput>({
    tipo: 'fijo',
    costo_min: undefined,
    costo_max: undefined,
    costo_hora: 0,
    divisa_id: 0,
    perfil_id: 0,
    seniority_id: 0,
    concepto: '',
    activo: true,
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

  const createMutation = useMutation({
    mutationFn: (data: CreateCostoPorHoraInput) => costoPorHoraService.create(data),
    onSuccess: () => {
      toast.success('Costo por hora creado exitosamente');
      navigate('/admin/costo-por-hora');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear costo por hora');
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
        title="Nuevo Costo por Hora"
        description="Crea un nuevo costo por hora"
        backLink={
          <Link
            to="/admin/costo-por-hora"
            className="p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Costo por Hora</CardTitle>
          <CardDescription>
            Completa los datos del costo por hora. Los campos marcados con * son obligatorios.
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
                      value={formData.divisa_id.toString()}
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
                      value={formData.perfil_id.toString()}
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
                      value={formData.seniority_id.toString()}
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Costo por Hora'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate('/admin/costo-por-hora')}
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
