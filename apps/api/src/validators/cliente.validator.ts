import { z } from 'zod';

export const clienteBaseSchema = z.object({
  nombre_cliente: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  cargo: z
    .string()
    .max(100, 'El cargo no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  empresa: z
    .string()
    .min(1, 'La empresa es requerida')
    .max(255, 'La empresa no puede exceder 255 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña no puede exceder 255 caracteres'),
  password_confirm: z
    .string()
    .min(8, 'La confirmación debe tener al menos 8 caracteres'),
  celular: z
    .string()
    .max(20, 'El celular no puede exceder 20 caracteres')
    .optional()
    .nullable(),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),
  anexo: z
    .string()
    .max(10, 'El anexo no puede exceder 10 caracteres')
    .optional()
    .nullable(),
  pais: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional().default(true),
});

export const clienteCreateSchema = clienteBaseSchema.refine((data) => data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
});

export const clienteUpdateSchema = clienteBaseSchema.partial();

export const clienteParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
