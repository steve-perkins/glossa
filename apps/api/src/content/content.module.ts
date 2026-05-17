import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { LearningLanguageEntity } from './entities/learning-language.entity';
import { LevelEntity } from './entities/level.entity';
import { UnitEntity } from './entities/unit.entity';
import { LessonEntity } from './entities/lesson.entity';
import { LessonSlideEntity } from './entities/lesson-slide.entity';
import { VocabItemEntity } from './entities/vocab-item.entity';
import { StoryEntity } from './entities/story.entity';
import { StoryParagraphEntity } from './entities/story-paragraph.entity';
import { ConversationScenarioEntity } from './entities/conversation-scenario.entity';
import { FreeChatModeEntity } from './entities/free-chat-mode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningLanguageEntity, LevelEntity, UnitEntity, LessonEntity, LessonSlideEntity,
      VocabItemEntity, StoryEntity, StoryParagraphEntity, ConversationScenarioEntity, FreeChatModeEntity,
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
