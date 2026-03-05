import { z } from 'zod';

export const createUsuarioSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(255, 'El nombre completo es muy largo'),
  usuario: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario es muy largo')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email es muy largo'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  rol_id: z
    .number()
    .int('El rol debe ser un número entero')
    .positive('El rol debe ser mayor a 0'),
});

export const updateUsuarioSchema = z.object({
  nombre_completo: z
    .string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(255, 'El nombre completo es muy largo')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email es muy largo')
    .optional(),
  activo: z
    .boolean()
    .optional(),
});

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
});

export type CreateUsuarioData = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioData = z.infer<typeof updateUsuarioSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
