import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { LearningLanguageEntity } from './learning-language.entity';

@Entity('free_chat_mode')
export class FreeChatModeEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'language_id' })
  languageId: string;

  @ManyToOne(() => LearningLanguageEntity, (l) => l.freeChatModes)
  @JoinColumn({ name: 'language_id' })
  language: LearningLanguageEntity;

  @Column({ length: 16 })
  kind: string;

  @Column({ name: 'native_title' })
  nativeTitle: string;

  @Column({ type: 'text' })
  blurb: string;

  @Column({ type: 'text', array: true })
  openers: string[];

  @Column({ type: 'text', array: true })
  starters: string[];
}
