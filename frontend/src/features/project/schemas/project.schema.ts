import { z } from 'zod';
import { nameSchema } from '@/lib/zod';

export const createProjectSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional().or(z.literal('')),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional().or(z.literal('')),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;