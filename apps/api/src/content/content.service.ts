import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ContentPayload, CefrLevel, LessonWithSlides } from '@glossa/shared';
import { SlideSchema } from '@glossa/shared';
import { LearningLanguageEntity } from './entities/learning-language.entity';
import { LevelEntity } from './entities/level.entity';
import { UnitEntity } from './entities/unit.entity';
import { LessonEntity } from './entities/lesson.entity';
import { LessonSlideEntity } from './entities/lesson-slide.entity';
import { VocabItemEntity } from './entities/vocab-item.entity';
import { StoryEntity } from './entities/story.entity';
import { ConversationScenarioEntity } from './entities/conversation-scenario.entity';
import { FreeChatModeEntity } from './entities/free-chat-mode.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(LearningLanguageEntity) private langRepo: Repository<LearningLanguageEntity>,
    @InjectRepository(LevelEntity) private levelRepo: Repository<LevelEntity>,
    @InjectRepository(UnitEntity) private unitRepo: Repository<UnitEntity>,
    @InjectRepository(LessonEntity) private lessonRepo: Repository<LessonEntity>,
    @InjectRepository(LessonSlideEntity) private slideRepo: Repository<LessonSlideEntity>,
    @InjectRepository(VocabItemEntity) private vocabRepo: Repository<VocabItemEntity>,
    @InjectRepository(StoryEntity) private storyRepo: Repository<StoryEntity>,
    @InjectRepository(ConversationScenarioEntity) private scenRepo: Repository<ConversationScenarioEntity>,
    @InjectRepository(FreeChatModeEntity) private freeRepo: Repository<FreeChatModeEntity>,
  ) {}

  async getLanguagePayload(langId: string): Promise<ContentPayload> {
    const lang = await this.langRepo.findOneBy({ id: langId });
    if (!lang) throw new NotFoundException(`Language '${langId}' not found`);

    const levels = await this.levelRepo.find({
      where: { languageId: lang.id },
      order: { ordinal: 'ASC' },
    });

    const unitsByLevel: Partial<Record<CefrLevel, ContentPayload['unitsByLevel'][CefrLevel]>> = {};
    for (const level of levels) {
      const units = await this.unitRepo.find({
        where: { levelId: level.id },
        order: { ordinal: 'ASC' },
      });
      const unitsWithLessons = await Promise.all(
        units.map(async (unit) => {
          const lessons = await this.lessonRepo.find({
            where: { unitId: unit.id },
            order: { ordinal: 'ASC' },
          });
          return {
            id: unit.id,
            ordinal: unit.ordinal,
            title: unit.title,
            subtitle: unit.subtitle,
            lessons: lessons.map((l) => ({
              id: l.id,
              ordinal: l.ordinal,
              title: l.title,
              description: l.description,
              status: l.status as 'done' | 'current' | 'next' | 'locked',
            })),
          };
        }),
      );
      unitsByLevel[level.name as CefrLevel] = unitsWithLessons;
    }

    const vocabItems = await this.vocabRepo.find({ where: { languageId: lang.id } });

    const stories = await this.storyRepo.find({
      where: { languageId: lang.id },
      relations: ['paragraphs'],
    });
    const storiesByLevel: Partial<Record<CefrLevel, ContentPayload['storiesByLevel'][CefrLevel]>> = {};
    for (const story of stories) {
      const level = levels.find((l) => l.id === story.levelId);
      if (!level) continue;
      const lvl = level.name as CefrLevel;
      if (!storiesByLevel[lvl]) storiesByLevel[lvl] = [];
      const paras = [...story.paragraphs].sort((a, b) => a.ordinal - b.ordinal);
      storiesByLevel[lvl]!.push({
        id: story.id,
        level: lvl,
        title: story.title,
        nativeTitle: story.nativeTitle,
        glyph: story.glyph,
        minutes: story.minutes,
        words: story.words,
        excerpt: story.excerpt,
        paragraphs: paras.map((p) => ({ ordinal: p.ordinal, targetText: p.targetText, englishText: p.englishText })),
      });
    }

    const scenarios = await this.scenRepo.find({ where: { languageId: lang.id } });
    const scenariosByLevel: Partial<Record<CefrLevel, ContentPayload['scenariosByLevel'][CefrLevel]>> = {};
    for (const sc of scenarios) {
      const level = levels.find((l) => l.id === sc.levelId);
      if (!level) continue;
      const lvl = level.name as CefrLevel;
      if (!scenariosByLevel[lvl]) scenariosByLevel[lvl] = [];
      scenariosByLevel[lvl]!.push({
        id: sc.id, level: lvl, title: sc.title, nativeTitle: sc.nativeTitle,
        glyph: sc.glyph, blurb: sc.blurb, character: sc.character, setting: sc.setting,
        goal: sc.goal, opener: sc.opener, starters: sc.starters,
      });
    }

    const freeChatModes = await this.freeRepo.find({ where: { languageId: lang.id } });

    return {
      language: { id: lang.id, name: lang.name, nativeName: lang.nativeName, flagCode: lang.flagCode, ttsVoice: lang.ttsVoice },
      levels: levels.map((l) => l.name as CefrLevel),
      unitsByLevel: unitsByLevel as ContentPayload['unitsByLevel'],
      vocabItems: vocabItems.map((v) => ({
        id: v.id, word: v.word, romanization: v.romanization, translation: v.translation,
        unitTitle: v.unitTitle, sentence: v.sentence, sentenceFull: v.sentenceFull, imageUrl: v.imageUrl,
      })),
      storiesByLevel: storiesByLevel as ContentPayload['storiesByLevel'],
      scenariosByLevel: scenariosByLevel as ContentPayload['scenariosByLevel'],
      freeChatModes: freeChatModes.map((f) => ({
        id: f.id, languageId: f.languageId, kind: f.kind as 'normal' | 'crosstalk',
        nativeTitle: f.nativeTitle, blurb: f.blurb, openers: f.openers, starters: f.starters,
      })),
    };
  }

  async getLessonWithSlides(lessonId: string): Promise<LessonWithSlides> {
    const lesson = await this.lessonRepo.findOneBy({ id: lessonId });
    if (!lesson) throw new NotFoundException(`Lesson '${lessonId}' not found`);

    const slideRows = await this.slideRepo.find({
      where: { lessonId },
      order: { ordinal: 'ASC' },
    });

    const slides = slideRows.map((row) => {
      const parsed = SlideSchema.safeParse({ type: row.type, ...row.payload });
      if (!parsed.success) throw new Error(`Invalid slide payload for slide ${row.id}: ${parsed.error.message}`);
      return parsed.data;
    });

    return { id: lesson.id, title: lesson.title, description: lesson.description, slides };
  }
}
