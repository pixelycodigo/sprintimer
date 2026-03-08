import { z } from 'zod';

export const eliminadoCreateSchema = z.object({
  item_id: z.number().int().positive('El ID del elemento es requerido'),
  item_tipo: z.enum([
    'cliente',
    'proyecto',
    'actividad',
    'talent',
    'perfil',
    'seniority',
    'divisa',
    'costo_por_hora',
    'sprint',
    'tarea'
  ]),
  eliminado_por: z.number().int().positive('El usuario que elimina es requerido'),
  fecha_borrado_permanente: z.string().transform((str) => new Date(str)),
  datos: z.record(z.unknown()),
});

export const eliminadoUpdateSchema = eliminadoCreateSchema.partial();

export const eliminadoParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
