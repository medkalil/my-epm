import { z } from 'zod';
import { nameSchema, passwordSchema } from '@/lib/zod';

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
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z.string().optional(),
    workEmail: z
      .string()
      .email('Invalid work email address')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;