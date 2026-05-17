import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { LessonEntity } from './lesson.entity';

@Entity('lesson_slide')
export class LessonSlideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ManyToOne(() => LessonEntity, (l) => l.slides)
  @JoinColumn({ name: 'lesson_id' })
  lesson: LessonEntity;

  @Column({ type: 'int' })
  ordinal: number;

  @Column({ length: 20 })
  type: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;
}
