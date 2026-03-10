import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientesService } from '../../../services/clientes.service';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import { Label } from '@ui/Label';
import { Checkbox } from '@ui/Checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/Card';
import { HeaderPage } from '@ui/HeaderPage';
import type { CreateClienteInput } from '@shared';

export default function AdminClientesCrear() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateClienteInput>({
    nombre_cliente: '',
    cargo: '',
    empresa: '',
    email: '',
    password: '',
    password_confirm: '',
    celular: '',
    telefono: '',
    anexo: '',
    pais: '',
    activo: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClienteInput) => clientesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesService.queryKeys.all() });
      toast.success('Cliente creado exitosamente');
      navigate('/admin/clientes');
    },
    onError: (error: any) => {
      // Mostrar mensaje específico del error de validación
      if (error.response?.data?.issues) {
        const issues = error.response.data.issues;

        // Agrupar errores por campo para mostrar mensaje claro
        const passwordErrors = issues
          .filter((issue: any) => issue.field === 'password')
          .map((issue: any) => issue.message);

        const confirmErrors = issues
          .filter((issue: any) => issue.field === 'password_confirm')
          .map((issue: any) => issue.message);

        const otherErrors = issues
          .filter((issue: any) => !['password', 'password_confirm'].includes(issue.field))
          .map((issue: any) => issue.message);

        // Mostrar errores de contraseña primero (los más importantes)
        if (passwordErrors.length > 0) {
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">❌ Error en la contraseña:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {passwordErrors.map((msg: string, i: number) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>,
            { duration: 8000 }
          );
        }

        if (confirmErrors.length > 0) {
          toast.error(confirmErrors.join('\n'), { duration: 5000 });
        }

        if (otherErrors.length > 0) {
          toast.error(otherErrors.join('\n'), { duration: 5000 });
        }
      } else if (error.response?.data?.message) {
        // Usar mensaje específico del backend
        toast.error(error.response.data.message, { duration: 5000 });
      } else {
        toast.error(error.message || 'Error al crear cliente');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos antes de enviar
    const errors: string[] = [];
    
    if (!formData.nombre_cliente || formData.nombre_cliente.trim() === '') {
      errors.push('El nombre del cliente es requerido');
    }
    if (!formData.empresa || formData.empresa.trim() === '') {
      errors.push('La empresa es requerida');
    }
    if (!formData.email || formData.email.trim() === '') {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido');
    }
    if (!formData.password || formData.password.length === 0) {
      errors.push('La contraseña es requerida');
    } else {
      // Validar requisitos de contraseña
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
    }
    if (!formData.password_confirm || formData.password_confirm.length === 0) {
      errors.push('La confirmación de contraseña es requerida');
    } else if (formData.password !== formData.password_confirm) {
      errors.push('Las contraseñas no coinciden');
    }
    
    // Si hay errores, mostrar en toast y no enviar
    if (errors.length > 0) {
      toast.error(
        <div className="space-y-2">
          <p className="font-semibold">❌ Campos requeridos:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {errors.map((msg: string, i: number) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>,
        { duration: 10000 }
      );
      return;
    }
    
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <HeaderPage
        title="Nuevo Cliente"
        description="Crea un nuevo cliente en la plataforma"
        backLink={
          <Link to="/admin/clientes">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        }
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>
            Completa los datos del cliente. Los campos marcados con * son obligatorios.
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

            {/* Contraseña */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" variant="required">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Mínimo 8 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="password_confirm" variant="required">Confirmar Contraseña</Label>
                  <Input
                    id="password_confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password_confirm}
                    onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Debe coincidir con la contraseña anterior
                  </p>
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
                Cliente activo
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
                {createMutation.isPending ? 'Creando...' : 'Crear Cliente'}
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
