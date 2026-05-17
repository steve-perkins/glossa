import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_vocab_srs')
export class UserVocabSrsEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'vocab_item_id' })
  vocabItemId: string;

  @Column({ type: 'float', default: 2.5 })
  ease: number;

  @Column({ name: 'interval_days', type: 'float', default: 0 })
  intervalDays: number;

  @Column({ name: 'due_at', type: 'timestamptz' })
  dueAt: Date;

  @Column({ name: 'last_result', type: 'int', default: 0 })
  lastResult: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;
}
