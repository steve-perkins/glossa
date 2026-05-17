import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import type { SrsResult } from '../srs/scheduler';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('progress/lessons')
  getLessonProgress(@Req() req: any) {
    return this.progressService.getLessonProgress(req.user.id);
  }

  @Post('progress/lessons/:lessonId')
  upsertLessonProgress(
    @Req() req: any,
    @Param('lessonId') lessonId: string,
    @Body() body: { status: 'in_progress' | 'done'; lastSlideOrdinal?: number },
  ) {
    return this.progressService.upsertLessonProgress(
      req.user.id,
      lessonId,
      body.status,
      body.lastSlideOrdinal,
    );
  }

  @Get('progress/stories')
  getStoryProgress(@Req() req: any) {
    return this.progressService.getStoryProgress(req.user.id);
  }

  @Post('progress/stories/:storyId')
  markStoryRead(@Req() req: any, @Param('storyId') storyId: string) {
    return this.progressService.markStoryRead(req.user.id, storyId);
  }

  @Get('srs/due')
  getSrsDue(
    @Req() req: any,
    @Query('langId') langId: string,
    @Query('limit') limit?: string,
  ) {
    return this.progressService.getSrsDue(req.user.id, langId, limit ? Number(limit) : 20);
  }

  @Post('srs/:vocabItemId/answer')
  submitAnswer(
    @Req() req: any,
    @Param('vocabItemId') vocabItemId: string,
    @Body() body: { result: SrsResult },
  ) {
    return this.progressService.submitSrsAnswer(req.user.id, vocabItemId, body.result);
  }

  @Get('srs/summary')
  getSrsSummary(@Req() req: any, @Query('langId') langId: string) {
    return this.progressService.getSrsSummary(req.user.id, langId);
  }
}
