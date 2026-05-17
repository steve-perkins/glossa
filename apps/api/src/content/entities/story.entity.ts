import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { LearningLanguageEntity } from './learning-language.entity';
import { LevelEntity } from './level.entity';
import { StoryParagraphEntity } from './story-paragraph.entity';

@Entity('story')
export class StoryEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'language_id' })
  languageId: string;

  @ManyToOne(() => LearningLanguageEntity, (l) => l.stories)
  @JoinColumn({ name: 'language_id' })
  language: LearningLanguageEntity;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => LevelEntity, (l) => l.stories)
  @JoinColumn({ name: 'level_id' })
  level: LevelEntity;

  @Column()
  title: string;

  @Column({ name: 'native_title' })
  nativeTitle: string;

  @Column({ length: 10 })
  glyph: string;

  @Column({ type: 'int' })
  minutes: number;

  @Column({ type: 'int' })
  words: number;

  @Column({ type: 'text' })
  excerpt: string;

  @OneToMany(() => StoryParagraphEntity, (p) => p.story, { eager: true })
  paragraphs: StoryParagraphEntity[];
}
