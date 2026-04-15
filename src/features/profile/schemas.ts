import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().max(60, 'First name must be 60 characters or less.').optional().or(z.literal('')),
  lastName: z.string().trim().max(60, 'Last name must be 60 characters or less.').optional().or(z.literal('')),
  avatarUrl: z.string().trim().url('Avatar URL must be valid.').optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
