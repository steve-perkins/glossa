import { z } from 'zod';

export const LearningLanguageSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(10),
  name: z.string(),
  nativeName: z.string(),
  flagCode: z.string().length(2).toUpperCase(),
  ttsVoice: z.string(),
});

export type LearningLanguage = z.infer<typeof LearningLanguageSchema>;
