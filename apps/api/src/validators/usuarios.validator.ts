import { z } from 'zod';

// Mensajes de error de contraseña reutilizables
const passwordMessages = {
  required: 'La contraseña es requerida',
  minLength: 'La contraseña debe tener al menos 8 caracteres',
  uppercase: 'debe contener al menos una letra mayúscula',
  lowercase: 'debe contener al menos una letra minúscula',
  number: 'debe contener al menos un número',
  confirm: 'Las contraseñas no coinciden',
};

// Función para validar contraseña con mensaje completo
const passwordSchema = z.string().superRefine((val, ctx) => {
  if (!val || val.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: passwordMessages.required,
    });
    return;
  }
  
  const errors: string[] = [];
  
  if (val.length < 8) {
    errors.push(passwordMessages.minLength);
  }
  if (!/[A-Z]/.test(val)) {
    errors.push(passwordMessages.uppercase);
  }
  if (!/[a-z]/.test(val)) {
    errors.push(passwordMessages.lowercase);
  }
  if (!/[0-9]/.test(val)) {
    errors.push(passwordMessages.number);
  }
  
  if (errors.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `La contraseña ${errors.join(', ')}.`,
    });
  }
});

export const createUsuarioSchema = z.object({
  nombre: z
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
  password: passwordSchema,
  password_confirm: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
  rol_id: z
    .number()
    .int('El rol debe ser un número entero')
    .positive('El rol debe ser mayor a 0'),
}).refine((data) => data.password === data.password_confirm, {
  message: passwordMessages.confirm,
  path: ['password_confirm'],
});

export const updateUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(255, 'El nombre completo es muy largo')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email es muy largo')
    .optional(),
  password: passwordSchema.optional(),
  password_confirm: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida')
    .optional(),
  activo: z
    .boolean()
    .optional(),
}).refine((data) => !data.password || data.password === data.password_confirm, {
  message: passwordMessages.confirm,
  path: ['password_confirm'],
});

export const changePasswordSchema = z.object({
  password: passwordSchema,
});

export type CreateUsuarioData = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioData = z.infer<typeof updateUsuarioSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
