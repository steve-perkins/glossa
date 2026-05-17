import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { LearningLanguageEntity } from './learning-language.entity';
import { UnitEntity } from './unit.entity';

@Entity('vocab_item')
export class VocabItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'language_id' })
  languageId: string;

  @ManyToOne(() => LearningLanguageEntity, (l) => l.vocabItems)
  @JoinColumn({ name: 'language_id' })
  language: LearningLanguageEntity;

  @Column({ name: 'unit_id', nullable: true })
  unitId: string | null;

  @ManyToOne(() => UnitEntity, (u) => u.vocabItems, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  unit: UnitEntity | null;

  @Column()
  word: string;

  @Column({ nullable: true, type: 'text' })
  romanization: string | null;

  @Column()
  translation: string;

  @Column({ name: 'unit_title' })
  unitTitle: string;

  @Column({ type: 'jsonb' })
  sentence: string[];

  @Column({ name: 'sentence_full' })
  sentenceFull: string;

  @Column({ name: 'image_url', nullable: true, type: 'text' })
  imageUrl: string | null;
}
