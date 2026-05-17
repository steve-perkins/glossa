import { z } from 'zod';

export const UserPrefsSchema = z.object({
  theme: z.string(),
  accent: z.string(),
  density: z.string(),
  targetLanguageId: z.string().nullable(),
});
export type UserPrefs = z.infer<typeof UserPrefsSchema>;

export const MeResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  prefs: UserPrefsSchema.nullable(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;
