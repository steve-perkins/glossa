import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { UserStoryProgressEntity } from './entities/user-story-progress.entity';
import { UserVocabSrsEntity } from './entities/user-vocab-srs.entity';
import { VocabItemEntity } from '../content/entities/vocab-item.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserLessonProgressEntity,
      UserStoryProgressEntity,
      UserVocabSrsEntity,
      VocabItemEntity,
    ]),
  ],
  providers: [ProgressService],
  controllers: [ProgressController],
})
export class ProgressModule {}
