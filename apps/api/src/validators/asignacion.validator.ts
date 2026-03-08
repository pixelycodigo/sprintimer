import { z } from 'zod';

export const asignacionCreateSchema = z.object({
  actividad_id: z.number().int().positive('La actividad es requerida'),
  talent_id: z.number().int().positive('El talent es requerido'),
});

export const asignacionUpdateSchema = asignacionCreateSchema.partial();

export const asignacionParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});

export const asignacionBulkSchema = z.object({
  actividad_id: z.number().int().positive('La actividad es requerida'),
  talent_ids: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un talent'),
});
