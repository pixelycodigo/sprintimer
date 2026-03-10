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

export const clienteBaseSchema = z.object({
  nombre_cliente: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  cargo: z
    .string()
    .max(100, 'El cargo no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  empresa: z
    .string()
    .min(1, 'La empresa es requerida')
    .max(255, 'La empresa no puede exceder 255 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: passwordSchema,
  password_confirm: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
  celular: z
    .string()
    .max(20, 'El celular no puede exceder 20 caracteres')
    .optional()
    .nullable(),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .nullable(),
  anexo: z
    .string()
    .max(10, 'El anexo no puede exceder 10 caracteres')
    .optional()
    .nullable(),
  pais: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  activo: z.boolean().optional().default(true),
});

export const clienteCreateSchema = clienteBaseSchema.refine((data) => data.password === data.password_confirm, {
  message: passwordMessages.confirm,
  path: ['password_confirm'],
});

// Para update, hacemos los campos opcionales pero mantenemos validación de password solo si se proporciona
export const clienteUpdateSchema = z.object({
  nombre_cliente: clienteBaseSchema.shape.nombre_cliente.optional(),
  cargo: clienteBaseSchema.shape.cargo,
  empresa: clienteBaseSchema.shape.empresa.optional(),
  email: clienteBaseSchema.shape.email.optional(),
  password: z.string().optional(),  // Si se proporciona, debe cumplir las reglas
  password_confirm: z.string().optional(),
  celular: clienteBaseSchema.shape.celular,
  telefono: clienteBaseSchema.shape.telefono,
  anexo: clienteBaseSchema.shape.anexo,
  pais: clienteBaseSchema.shape.pais,
  activo: clienteBaseSchema.shape.activo,
}).refine((data) => {
  // Solo validar password si se está proporcionando uno nuevo
  if (data.password && data.password.length > 0) {
    return data.password === data.password_confirm;
  }
  return true;
}, {
  message: passwordMessages.confirm,
  path: ['password_confirm'],
});

export const clienteParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número'),
});
