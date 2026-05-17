import { z } from 'zod';

export const VocabItemSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  romanization: z.string().nullable(),
  translation: z.string(),
  unitTitle: z.string(),
  sentence: z.array(z.string()),
  sentenceFull: z.string(),
  imageUrl: z.string().url().nullable(),
});

export type VocabItem = z.infer<typeof VocabItemSchema>;
