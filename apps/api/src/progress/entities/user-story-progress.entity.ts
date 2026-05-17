import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_story_progress')
export class UserStoryProgressEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'story_id' })
  storyId: string;

  @CreateDateColumn({ name: 'read_at' })
  readAt: Date;
}
