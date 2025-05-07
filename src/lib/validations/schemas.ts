import { z } from 'zod';

// Schemas de validação reutilizáveis
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

export const moneySchema = z
  .string()
  .min(1, 'Amount is required')
  .regex(/^\d+(\.\d{0,2})?$/, 'Invalid amount format');

// Schema para o formulário de transação
export const transactionFormSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters long'),
  amount: moneySchema,
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
});

// Schema para o formulário de metas
export const goalFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  target_amount: moneySchema,
  current_amount: moneySchema.optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

// Schema para o formulário de login
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Schema para o formulário de cadastro
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
