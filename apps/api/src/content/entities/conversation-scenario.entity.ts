import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { LearningLanguageEntity } from './learning-language.entity';
import { LevelEntity } from './level.entity';

@Entity('conversation_scenario')
export class ConversationScenarioEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'language_id' })
  languageId: string;

  @ManyToOne(() => LearningLanguageEntity, (l) => l.scenarios)
  @JoinColumn({ name: 'language_id' })
  language: LearningLanguageEntity;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => LevelEntity, (l) => l.scenarios)
  @JoinColumn({ name: 'level_id' })
  level: LevelEntity;

  @Column()
  title: string;

  @Column({ name: 'native_title' })
  nativeTitle: string;

  @Column({ length: 10 })
  glyph: string;

  @Column({ type: 'text' })
  blurb: string;

  @Column({ type: 'text' })
  character: string;

  @Column({ type: 'text' })
  setting: string;

  @Column({ type: 'text' })
  goal: string;

  @Column({ type: 'text' })
  opener: string;

  @Column({ type: 'jsonb' })
  starters: string[];
}
