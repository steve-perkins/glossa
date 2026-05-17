import { z } from 'zod';
import { SlideSchema } from './slide';

export const LessonWithSlidesSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  slides: z.array(SlideSchema),
});

export type LessonWithSlides = z.infer<typeof LessonWithSlidesSchema>;
