import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { UnitEntity } from './unit.entity';
import { LessonSlideEntity } from './lesson-slide.entity';

@Entity('lesson')
export class LessonEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'unit_id' })
  unitId: string;

  @ManyToOne(() => UnitEntity, (u) => u.lessons)
  @JoinColumn({ name: 'unit_id' })
  unit: UnitEntity;

  @Column({ type: 'int' })
  ordinal: number;

  @Column()
  title: string;

  @Column()
  description: string;

  // Placeholder status seeded from prototype data. Replaced by user_lesson_progress in Phase 4.
  @Column({ default: 'locked' })
  status: string;

  @OneToMany(() => LessonSlideEntity, (s) => s.lesson)
  slides: LessonSlideEntity[];
}
