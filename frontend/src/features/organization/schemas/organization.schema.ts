import { z } from 'zod';
import { emailSchema, nameSchema, slugSchema } from '@/lib/zod';
import { OrgRole } from '@/types/common';

export const createOrganizationSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional().or(z.literal('')),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: emailSchema,
  role: z.nativeEnum(OrgRole).refine((role) => role !== OrgRole.OWNER, {
    message: 'OWNER role cannot be assigned via invite',
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;