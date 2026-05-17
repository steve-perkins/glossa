import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_lesson_progress')
export class UserLessonProgressEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'lesson_id' })
  lessonId: string;

  @Column({ length: 16, default: 'in_progress' })
  status: string;

  @Column({ name: 'last_slide_ordinal', type: 'int', nullable: true })
  lastSlideOrdinal: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
