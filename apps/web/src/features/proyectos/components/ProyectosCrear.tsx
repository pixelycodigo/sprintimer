import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { proyectosService } from '../../../services/proyectos.service';
import { clientesService } from '../../../services/clientes.service';
import { buildPath } from '../../../utils/getBasePath';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateProyectoInput } from '@shared';

export default function AdminProyectosCrear() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProyectoInput>({
    cliente_id: 0,
    nombre: '',
    descripcion: '',
    modalidad: 'ad-hoc',
    formato_horas: 'minutos',
    moneda_id: undefined,
    activo: true,
  });

  // Fetch clientes para el select
  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.findAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProyectoInput) => proyectosService.create(data),
    onSuccess: () => {
      toast.success('Proyecto creado exitosamente');
      navigate(buildPath('/admin/proyectos'));
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear proyecto');
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
        title="Nuevo Proyecto"
        description="Crea un nuevo proyecto para un cliente"
        backLink={
          <Link to={buildPath('/admin/proyectos')}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>
            Completa los datos del proyecto. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="cliente_id" variant="required">Cliente</Label>
                  <Select
                    value={formData.cliente_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nombre_cliente} - {cliente.empresa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nombre" variant="required">Nombre del Proyecto</Label>
                  <Input
                    id="nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Desarrollo de Aplicación Web"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del proyecto"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modalidad" variant="required">Modalidad</Label>
                    <Select
                      value={formData.modalidad}
                      onValueChange={(value: 'sprint' | 'ad-hoc') => setFormData({ ...formData, modalidad: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sprint">Sprint</SelectItem>
                        <SelectItem value="ad-hoc">Ad-hoc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="formato_horas" variant="required">Formato de Horas</Label>
                    <Select
                      value={formData.formato_horas}
                      onValueChange={(value: 'minutos' | 'cuartiles' | 'sin_horas') => setFormData({ ...formData, formato_horas: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutos">Minutos</SelectItem>
                        <SelectItem value="cuartiles">Cuartiles</SelectItem>
                        <SelectItem value="sin_horas">Sin horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                Proyecto activo
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
                {createMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate(buildPath('/admin/proyectos'))}
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
