import { z } from 'zod';

export const costoPorHoraCreateSchema = z.object({
  tipo: z.enum(['fijo', 'variable'], {
    errorMap: () => ({ message: 'El tipo debe ser "fijo" o "variable"' }),
  }),
  costo_min: z.number().positive().optional().nullable(),
  costo_max: z.number().positive().optional().nullable(),
  costo_hora: z.number().positive('El costo por hora debe ser positivo'),
  divisa_id: z.number().int().positive('La divisa es requerida'),
  perfil_id: z.number().int().positive('El perfil es requerido'),
  seniority_id: z.number().int().positive('El seniority es requerido'),
  concepto: z
    .string()
    .max(255, 'El concepto no puede exceder 255 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional().default(true),
});

export const costoPorHoraUpdateSchema = costoPorHoraCreateSchema.partial();

export const costoPorHoraParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
