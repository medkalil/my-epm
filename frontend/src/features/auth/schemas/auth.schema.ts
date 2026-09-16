import { z } from 'zod';
import { nameSchema, passwordSchema, emailSchema } from '@/lib/zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username or email is required')
    .min(2, 'Username or email must be at least 2 characters')
    .max(100, 'Username or email must not exceed 100 characters'),
  password: passwordSchema,
  rememberSession: z.boolean().optional(),
  workspaceSlug: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: nameSchema,
    fullName: z.string().min(2, 'Full name is required'),
    workEmail: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;