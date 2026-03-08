import { z } from 'zod';

export const seniorityCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre del seniority es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  nivel_orden: z.number().int().positive('El nivel debe ser un número positivo'),
  activo: z.boolean().optional().default(true),
});

export const seniorityUpdateSchema = seniorityCreateSchema.partial();

export const seniorityParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
