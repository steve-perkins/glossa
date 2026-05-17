import { z } from 'zod';
import { CefrLevelSchema } from './level';

export const ScenarioSchema = z.object({
  id: z.string(),
  level: CefrLevelSchema,
  title: z.string(),
  nativeTitle: z.string(),
  glyph: z.string(),
  blurb: z.string(),
  character: z.string(),
  setting: z.string(),
  goal: z.string(),
  opener: z.string(),
  starters: z.array(z.string()),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
