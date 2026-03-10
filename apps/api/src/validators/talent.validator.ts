import { z } from 'zod';

// Mensajes de error de contraseña reutilizables
const passwordMessages = {
  required: 'La contraseña es requerida',
  minLength: 'debe tener al menos 8 caracteres',
  uppercase: 'debe contener al menos una letra mayúscula (A-Z)',
  lowercase: 'debe contener al menos una letra minúscula (a-z)',
  number: 'debe contener al menos un número (0-9)',
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
  password: passwordSchema,
  password_confirm: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
  costo_hora_fijo: z.number().positive().optional().nullable(),
  costo_hora_variable_min: z.number().positive().optional().nullable(),
  costo_hora_variable_max: z.number().positive().optional().nullable(),
  activo: z.boolean().optional().default(true),
}).refine((data) => data.password === data.password_confirm, {
  message: passwordMessages.confirm,
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
}).refine((data) => {
  // Si hay password, debe coincidir con la confirmación
  if (data.password && data.password.length > 0) {
    return !data.password_confirm || data.password === data.password_confirm;
  }
  return true;
}, {
  message: passwordMessages.confirm,
  path: ['password_confirm'],
});

export const talentParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});

export const talentPasswordSchema = z.object({
  password: passwordSchema,
});
