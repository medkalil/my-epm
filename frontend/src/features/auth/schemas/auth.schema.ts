import { z } from 'zod';
import { nameSchema, passwordSchema, emailSchema } from '@/lib/zod';

export const loginSchema = z.object({
  username: nameSchema,
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