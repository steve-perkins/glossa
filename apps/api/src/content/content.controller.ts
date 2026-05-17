import { Controller, Get, Param } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':languageCode')
  getLanguagePayload(@Param('languageCode') languageCode: string) {
    return this.contentService.getLanguagePayload(languageCode);
  }

  @Get(':languageCode/lessons/:lessonId')
  getLessonWithSlides(@Param('lessonId') lessonId: string) {
    return this.contentService.getLessonWithSlides(lessonId);
  }
}
