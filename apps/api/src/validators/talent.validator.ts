import { z } from 'zod';

export const talentCreateSchema = z.object({
  usuario_id: z.number().int().positive().optional(),
  perfil_id: z.number().int().positive('El perfil es requerido'),
  seniority_id: z.number().int().positive('El seniority es requerido'),
  nombre_completo: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(255, 'El apellido no puede exceder 255 caracteres'),
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
  costo_hora_fijo: z.number().positive().optional().nullable(),
  costo_hora_variable_min: z.number().positive().optional().nullable(),
  costo_hora_variable_max: z.number().positive().optional().nullable(),
  activo: z.boolean().optional().default(true),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
});

// Schema para update - permite password vacío (se ignora si está vacío)
export const talentUpdateSchema = z.object({
  usuario_id: z.number().int().positive().optional().nullable(),
  perfil_id: z.number().int().positive().optional(),
  seniority_id: z.number().int().positive().optional(),
  nombre_completo: z.string().min(1).max(255).optional(),
  apellido: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().optional(),  // Permite string vacío
  password_confirm: z.string().optional(),
  costo_hora_fijo: z.number().positive().optional().nullable(),
  costo_hora_variable_min: z.number().positive().optional().nullable(),
  costo_hora_variable_max: z.number().positive().optional().nullable(),
  activo: z.boolean().optional(),
}).refine((data) => !data.password || data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
});

export const talentParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});

export const talentPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña no puede exceder 255 caracteres'),
});
