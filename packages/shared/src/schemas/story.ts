import { z } from 'zod';
import { CefrLevelSchema } from './level';

export const StoryParagraphSchema = z.object({
  ordinal: z.number().int(),
  targetText: z.string(),
  englishText: z.string(),
});

export const StorySchema = z.object({
  id: z.string(),
  level: CefrLevelSchema,
  title: z.string(),
  nativeTitle: z.string(),
  glyph: z.string(),
  minutes: z.number().int(),
  words: z.number().int(),
  excerpt: z.string(),
  paragraphs: z.array(StoryParagraphSchema),
});

export type StoryParagraph = z.infer<typeof StoryParagraphSchema>;
export type Story = z.infer<typeof StorySchema>;
