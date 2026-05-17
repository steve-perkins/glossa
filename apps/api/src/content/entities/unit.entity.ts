import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { LevelEntity } from './level.entity';
import { LessonEntity } from './lesson.entity';
import { VocabItemEntity } from './vocab-item.entity';

@Entity('unit')
export class UnitEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => LevelEntity, (l) => l.units)
  @JoinColumn({ name: 'level_id' })
  level: LevelEntity;

  @Column({ type: 'int' })
  ordinal: number;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @OneToMany(() => LessonEntity, (l) => l.unit)
  lessons: LessonEntity[];

  @OneToMany(() => VocabItemEntity, (v) => v.unit)
  vocabItems: VocabItemEntity[];
}
