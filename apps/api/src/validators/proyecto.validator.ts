import { z } from 'zod';

export const proyectoCreateSchema = z.object({
  cliente_id: z.number().int().positive('El cliente es requerido'),
  nombre: z
    .string()
    .min(1, 'El nombre del proyecto es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
  modalidad: z.enum(['sprint', 'ad-hoc'], {
    errorMap: () => ({ message: 'La modalidad debe ser "sprint" o "ad-hoc"' }),
  }),
  formato_horas: z.enum(['minutos', 'cuartiles', 'sin_horas'], {
    errorMap: () => ({ message: 'El formato de horas debe ser "minutos", "cuartiles" o "sin_horas"' }),
  }),
  moneda_id: z.number().int().positive().optional().nullable(),
  activo: z.boolean().optional().default(true),
});

export const proyectoUpdateSchema = proyectoCreateSchema.partial();

export const proyectoParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
