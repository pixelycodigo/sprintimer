import { z } from 'zod';

export const perfilCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre del perfil es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional().default(true),
});

export const perfilUpdateSchema = perfilCreateSchema.partial();

export const perfilParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
