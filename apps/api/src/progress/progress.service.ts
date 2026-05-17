import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import type { VocabItem } from '@glossa/shared';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { UserStoryProgressEntity } from './entities/user-story-progress.entity';
import { UserVocabSrsEntity } from './entities/user-vocab-srs.entity';
import { VocabItemEntity } from '../content/entities/vocab-item.entity';
import { computeNextSrs } from '../srs/scheduler';
import type { SrsResult } from '../srs/scheduler';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserLessonProgressEntity)
    private lessonProgressRepo: Repository<UserLessonProgressEntity>,
    @InjectRepository(UserStoryProgressEntity)
    private storyProgressRepo: Repository<UserStoryProgressEntity>,
    @InjectRepository(UserVocabSrsEntity)
    private srsRepo: Repository<UserVocabSrsEntity>,
    @InjectRepository(VocabItemEntity)
    private vocabRepo: Repository<VocabItemEntity>,
  ) {}

  async getLessonProgress(userId: string): Promise<Record<string, 'in_progress' | 'done'>> {
    const rows = await this.lessonProgressRepo.findBy({ userId });
    return Object.fromEntries(rows.map((r) => [r.lessonId, r.status as 'in_progress' | 'done']));
  }

  async upsertLessonProgress(
    userId: string,
    lessonId: string,
    status: 'in_progress' | 'done',
    lastSlideOrdinal?: number,
  ): Promise<void> {
    await this.lessonProgressRepo.upsert(
      { userId, lessonId, status, lastSlideOrdinal: lastSlideOrdinal ?? null },
      ['userId', 'lessonId'],
    );
  }

  async getStoryProgress(userId: string): Promise<string[]> {
    const rows = await this.storyProgressRepo.findBy({ userId });
    return rows.map((r) => r.storyId);
  }

  async markStoryRead(userId: string, storyId: string): Promise<void> {
    const existing = await this.storyProgressRepo.findOneBy({ userId, storyId });
    if (!existing) {
      await this.storyProgressRepo.save(this.storyProgressRepo.create({ userId, storyId }));
    }
  }

  async getSrsDue(userId: string, langId: string, limit = 20): Promise<VocabItem[]> {
    const now = new Date();
    const dueRows = await this.srsRepo.find({
      where: { userId, dueAt: LessThanOrEqual(now) },
      order: { dueAt: 'ASC' },
    });

    const dueVocabIds = new Set(dueRows.map((r) => r.vocabItemId));

    const vocabItems = await this.vocabRepo.findBy({ languageId: langId });
    const dueItems = vocabItems.filter((v) => dueVocabIds.has(v.id));

    const seen = new Set(dueItems.map((v) => v.id));
    const newItems = vocabItems.filter((v) => !seen.has(v.id));

    const combined = [...dueItems, ...shuffle(newItems)].slice(0, limit);

    return combined.map((v) => ({
      id: v.id,
      word: v.word,
      romanization: v.romanization,
      translation: v.translation,
      unitTitle: v.unitTitle,
      sentence: v.sentence,
      sentenceFull: v.sentenceFull,
      imageUrl: v.imageUrl,
    }));
  }

  async submitSrsAnswer(userId: string, vocabItemId: string, result: SrsResult): Promise<void> {
    const existing = await this.srsRepo.findOneBy({ userId, vocabItemId });
    const next = computeNextSrs(existing ?? null, result);
    await this.srsRepo.upsert(
      {
        userId,
        vocabItemId,
        ease: next.ease,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        dueAt: next.dueAt,
        lastResult: result === 'wrong' ? 0 : result === 'correct' ? 1 : 2,
      },
      ['userId', 'vocabItemId'],
    );
  }

  async getSrsSummary(userId: string, langId: string): Promise<{ mastered: number; due: number }> {
    const now = new Date();
    const vocabItems = await this.vocabRepo.findBy({ languageId: langId });
    const vocabIds = new Set(vocabItems.map((v) => v.id));

    const srsRows = await this.srsRepo.findBy({ userId });
    const relevant = srsRows.filter((r) => vocabIds.has(r.vocabItemId));

    const mastered = relevant.filter((r) => r.intervalDays >= 21).length;
    const due = relevant.filter((r) => r.dueAt <= now).length;

    return { mastered, due };
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
