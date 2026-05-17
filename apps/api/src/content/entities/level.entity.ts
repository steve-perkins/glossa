import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { LearningLanguageEntity } from './learning-language.entity';
import { UnitEntity } from './unit.entity';
import { StoryEntity } from './story.entity';
import { ConversationScenarioEntity } from './conversation-scenario.entity';

@Entity('level')
export class LevelEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'language_id' })
  languageId: string;

  @ManyToOne(() => LearningLanguageEntity, (l) => l.levels)
  @JoinColumn({ name: 'language_id' })
  language: LearningLanguageEntity;

  @Column({ length: 2 })
  name: string;

  @Column({ type: 'int' })
  ordinal: number;

  @OneToMany(() => UnitEntity, (u) => u.level)
  units: UnitEntity[];

  @OneToMany(() => StoryEntity, (s) => s.level)
  stories: StoryEntity[];

  @OneToMany(() => ConversationScenarioEntity, (s) => s.level)
  scenarios: ConversationScenarioEntity[];
}
