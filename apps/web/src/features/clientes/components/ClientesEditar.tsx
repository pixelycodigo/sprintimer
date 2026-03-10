import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientesService } from '../../../services/clientes.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Muted } from '@ui/Typography';
import { Spinner } from '@ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import type { UpdateClienteInput } from '@shared';

interface UpdateClienteForm extends UpdateClienteInput {
  password?: string;
  password_confirm?: string;
}

export default function AdminClientesEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<UpdateClienteForm>({
    nombre_cliente: '',
    cargo: '',
    empresa: '',
    email: '',
    celular: '',
    telefono: '',
    anexo: '',
    pais: '',
    activo: true,
    password: '',
    password_confirm: '',
  });

  // Fetch cliente
  const { data: cliente, isLoading: isLoadingCliente } = useQuery({
    queryKey: clientesService.queryKeys.byId(Number(id)),
    queryFn: () => clientesService.findById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateClienteInput) => clientesService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesService.queryKeys.all() });
      queryClient.invalidateQueries({ queryKey: clientesService.queryKeys.byId(Number(id)) });
      toast.success('Cliente actualizado exitosamente');
      navigate('/admin/clientes');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar cliente');
    },
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre_cliente: cliente.nombre_cliente,
        cargo: cliente.cargo || '',
        empresa: cliente.empresa,
        email: cliente.email,
        celular: cliente.celular || '',
        telefono: cliente.telefono || '',
        anexo: cliente.anexo || '',
        pais: cliente.pais || '',
        activo: Boolean(cliente.activo),  // Convertir a booleano
        password: '',  // No cargar password existente
        password_confirm: '',
      });
    }
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo incluir password si el usuario lo completó
    const submitData: any = {
      nombre_cliente: formData.nombre_cliente,
      cargo: formData.cargo,
      empresa: formData.empresa,
      email: formData.email,
      celular: formData.celular,
      telefono: formData.telefono,
      anexo: formData.anexo,
      pais: formData.pais,
      activo: formData.activo,
    };
    
    // Solo agregar password si fue modificado
    if (formData.password && formData.password.length > 0) {
      // Validar requisitos de contraseña
      const errors: string[] = [];
      
      if (formData.password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula (A-Z)');
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula (a-z)');
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.push('La contraseña debe contener al menos un número (0-9)');
      }
      if (formData.password !== formData.password_confirm) {
        errors.push('Las contraseñas no coinciden');
      }
      
      if (errors.length > 0) {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">❌ Error en la contraseña:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {errors.map((msg: string, i: number) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>,
          { duration: 8000 }
        );
        return;
      }
      
      submitData.password = formData.password;
      submitData.password_confirm = formData.password_confirm;
    }
    
    updateMutation.mutate(submitData);
  };

  if (isLoadingCliente) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/clientes"
          className="inline-flex items-center justify-center p-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Editar Cliente</h1>
          <Muted>Actualiza la información del cliente</Muted>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>
            Actualiza los datos del cliente. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre_cliente" variant="required">Nombre del Cliente</Label>
                  <Input
                    id="nombre_cliente"
                    required
                    value={formData.nombre_cliente}
                    onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <Label htmlFor="empresa" variant="required">Empresa</Label>
                  <Input
                    id="empresa"
                    required
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Empresa S.A."
                  />
                </div>

                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Gerente de Proyecto"
                  />
                </div>

                <div>
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais || ''}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    placeholder="Perú"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" variant="required">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular || ''}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    placeholder="+51 999 999 999"
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="(01) 999-9999"
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <Label htmlFor="anexo">Anexo</Label>
                  <Input
                    id="anexo"
                    value={formData.anexo || ''}
                    onChange={(e) => setFormData({ ...formData, anexo: e.target.value })}
                    placeholder="1234"
                  />
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <input
                id="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Cliente activo
              </Label>
            </div>

            {/* Contraseña */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Cambiar Contraseña
              </h3>
              <Muted>Deja estos campos vacíos si no deseas cambiar la contraseña</Muted>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
                  </p>
                </div>

                <div>
                  <Label htmlFor="password_confirm">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password_confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.password_confirm}
                      onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                      className="pr-10 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
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
                onClick={() => navigate('/admin/clientes')}
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
