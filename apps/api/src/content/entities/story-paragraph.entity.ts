import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { StoryEntity } from './story.entity';

@Entity('story_paragraph')
export class StoryParagraphEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'story_id' })
  storyId: string;

  @ManyToOne(() => StoryEntity, (s) => s.paragraphs)
  @JoinColumn({ name: 'story_id' })
  story: StoryEntity;

  @Column({ type: 'int' })
  ordinal: number;

  @Column({ name: 'target_text', type: 'text' })
  targetText: string;

  @Column({ name: 'english_text', type: 'text' })
  englishText: string;
}
