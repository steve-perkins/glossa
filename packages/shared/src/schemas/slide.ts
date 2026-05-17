import { z } from 'zod';

export const GrammarSlideSchema = z.object({
  type: z.literal('grammar'),
  title: z.string(),
  body: z.array(z.string()).min(1),
  callout: z.string().optional(),
  table: z
    .object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .optional(),
});

export const VocabSlideSchema = z.object({
  type: z.literal('vocab'),
  word: z.string(),
  romanization: z.string(),
  translation: z.string(),
  example: z.object({ target: z.string(), english: z.string() }),
  imageUrl: z.string().url().optional(),
  photoLabel: z.string().optional(),
});

export const MCSlideSchema = z.object({
  type: z.literal('mc'),
  prompt: z.string(),
  english: z.string(),
  sentence: z.array(z.string()),
  answers: z.array(z.string()).min(1),
  bank: z.array(z.string()).min(1),
});

export const FillSlideSchema = z.object({
  type: z.literal('fill'),
  prompt: z.string(),
  english: z.string(),
  sentence: z.array(z.string()),
  answer: z.string(),
  hint: z.string().optional(),
});

export const DoneSlideSchema = z.object({
  type: z.literal('done'),
  title: z.string(),
  stats: z.array(z.object({ num: z.union([z.number(), z.string()]), lbl: z.string() })),
});

export const SlideSchema = z.discriminatedUnion('type', [
  GrammarSlideSchema,
  VocabSlideSchema,
  MCSlideSchema,
  FillSlideSchema,
  DoneSlideSchema,
]);

export type GrammarSlide = z.infer<typeof GrammarSlideSchema>;
export type VocabSlide = z.infer<typeof VocabSlideSchema>;
export type MCSlide = z.infer<typeof MCSlideSchema>;
export type FillSlide = z.infer<typeof FillSlideSchema>;
export type DoneSlide = z.infer<typeof DoneSlideSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideType = Slide['type'];
