import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { divisasService } from '../../../services/divisas.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import type { UpdateDivisaInput } from '@shared';

export default function AdminDivisasEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateDivisaInput>({
    codigo: '',
    simbolo: '',
    nombre: '',
    activo: true,
  });

  // Fetch divisa
  const { data: divisa, isLoading: isLoadingDivisa } = useQuery({
    queryKey: ['divisa', id],
    queryFn: () => divisasService.findById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateDivisaInput) => divisasService.update(Number(id), data),
    onSuccess: () => {
      toast.success('Divisa actualizada exitosamente');
      navigate('/admin/divisas');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar divisa');
    },
  });

  useEffect(() => {
    if (divisa) {
      setFormData({
        codigo: divisa.codigo,
        simbolo: divisa.simbolo,
        nombre: divisa.nombre,
        activo: divisa.activo,
      });
    }
  }, [divisa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoadingDivisa) {
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
        title="Editar Divisa"
        description="Actualiza la información de la divisa"
        backLink={
          <Link to="/admin/divisas">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Divisa</CardTitle>
          <CardDescription>
            Actualiza los datos de la divisa. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="codigo" variant="required">Código</Label>
                  <Input
                    id="codigo"
                    required
                    maxLength={3}
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="USD"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    3 caracteres (ej: USD, EUR, PEN)
                  </p>
                </div>

                <div>
                  <Label htmlFor="simbolo" variant="required">Símbolo</Label>
                  <Input
                    id="simbolo"
                    required
                    maxLength={5}
                    value={formData.simbolo}
                    onChange={(e) => setFormData({ ...formData, simbolo: e.target.value })}
                    placeholder="$"
                  />
                </div>

                <div>
                  <Label htmlFor="nombre" variant="required">Nombre</Label>
                  <Input
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Dólar Estadounidense"
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
                Divisa activa
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
                onClick={() => navigate('/admin/divisas')}
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
