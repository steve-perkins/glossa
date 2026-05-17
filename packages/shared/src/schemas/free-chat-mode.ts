import { z } from 'zod';

export const FreeChatModeSchema = z.object({
  id: z.string(),
  languageId: z.string(),
  kind: z.enum(['normal', 'crosstalk']),
  nativeTitle: z.string(),
  blurb: z.string(),
  openers: z.array(z.string()),
  starters: z.array(z.string()),
});

export type FreeChatMode = z.infer<typeof FreeChatModeSchema>;
