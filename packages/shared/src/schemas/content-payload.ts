import { z } from 'zod';
import { LearningLanguageSchema } from './language';
import { CefrLevelSchema } from './level';
import { UnitSchema } from './unit';
import { VocabItemSchema } from './vocab-item';
import { StorySchema } from './story';
import { ScenarioSchema } from './scenario';
import { FreeChatModeSchema } from './free-chat-mode';

export const ContentPayloadSchema = z.object({
  language: LearningLanguageSchema,
  levels: z.array(CefrLevelSchema),
  unitsByLevel: z.record(CefrLevelSchema, z.array(UnitSchema)),
  vocabItems: z.array(VocabItemSchema),
  storiesByLevel: z.record(CefrLevelSchema, z.array(StorySchema)),
  scenariosByLevel: z.record(CefrLevelSchema, z.array(ScenarioSchema)),
  freeChatModes: z.array(FreeChatModeSchema),
});

export type ContentPayload = z.infer<typeof ContentPayloadSchema>;
