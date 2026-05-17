import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { LevelEntity } from './level.entity';
import { VocabItemEntity } from './vocab-item.entity';
import { StoryEntity } from './story.entity';
import { ConversationScenarioEntity } from './conversation-scenario.entity';
import { FreeChatModeEntity } from './free-chat-mode.entity';

@Entity('learning_language')
export class LearningLanguageEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ name: 'native_name' })
  nativeName: string;

  @Column({ name: 'flag_code', length: 2 })
  flagCode: string;

  @Column({ name: 'tts_voice' })
  ttsVoice: string;

  @OneToMany(() => LevelEntity, (l) => l.language)
  levels: LevelEntity[];

  @OneToMany(() => VocabItemEntity, (v) => v.language)
  vocabItems: VocabItemEntity[];

  @OneToMany(() => StoryEntity, (s) => s.language)
  stories: StoryEntity[];

  @OneToMany(() => ConversationScenarioEntity, (s) => s.language)
  scenarios: ConversationScenarioEntity[];

  @OneToMany(() => FreeChatModeEntity, (f) => f.language)
  freeChatModes: FreeChatModeEntity[];
}
