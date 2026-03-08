import { z } from 'zod';

export const actividadCreateSchema = z.object({
  proyecto_id: z.number().int().positive('El proyecto es requerido'),
  sprint_id: z.number().int().positive().optional().nullable(),
  nombre: z
    .string()
    .min(1, 'El nombre de la actividad es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  horas_estimadas: z.number().positive('Las horas estimadas deben ser positivas'),
  activo: z.boolean().optional().default(true),
});

export const actividadUpdateSchema = actividadCreateSchema.partial();

export const actividadParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
