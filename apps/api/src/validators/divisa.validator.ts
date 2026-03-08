import { z } from 'zod';

export const divisaCreateSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(3, 'El código no puede exceder 3 caracteres'),
  simbolo: z
    .string()
    .min(1, 'El símbolo es requerido')
    .max(5, 'El símbolo no puede exceder 5 caracteres'),
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  activo: z.boolean().optional().default(true),
});

export const divisaUpdateSchema = divisaCreateSchema.partial();

export const divisaParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
