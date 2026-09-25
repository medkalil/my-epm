import { z } from 'zod';
import { nameSchema, passwordSchema, emailSchema, slugSchema } from '@/lib/zod';

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

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or email is required')
    .min(2, 'Username or email must be at least 2 characters')
    .max(100, 'Username or email must not exceed 100 characters'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z
  .object({
    username: nameSchema,
    fullName: z.string().min(2, 'Full name is required'),
    workEmail: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    organizationName: nameSchema,
    organizationSlug: slugSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const joinRegisterSchema = z
  .object({
    username: nameSchema,
    fullName: z.string().min(2, 'Full name is required'),
    workEmail: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    joinOrganizationSlug: slugSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type JoinRegisterFormValues = z.infer<typeof joinRegisterSchema>;

export const registerStep1Fields = [
  'fullName',
  'workEmail',
  'username',
  'password',
  'confirmPassword',
] as const;