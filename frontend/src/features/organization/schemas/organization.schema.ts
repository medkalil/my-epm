import { z } from 'zod';
import { nameSchema, slugSchema } from '@/lib/zod';
import { OrgRole } from '@/types/common';

export const createOrganizationSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional().or(z.literal('')),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z
  .object({
    userId: z.number().int().positive('Select a user'),
    role: z.nativeEnum(OrgRole),
  });

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;