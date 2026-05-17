import { z } from 'zod';

export const LessonSummarySchema = z.object({
  id: z.string(),
  ordinal: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['done', 'current', 'next', 'locked']),
});

export const UnitSchema = z.object({
  id: z.string(),
  ordinal: z.number().int(),
  title: z.string(),
  subtitle: z.string(),
  lessons: z.array(LessonSummarySchema),
});

export type LessonSummary = z.infer<typeof LessonSummarySchema>;
export type Unit = z.infer<typeof UnitSchema>;
