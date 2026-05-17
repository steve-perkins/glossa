import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMe(@Req() req: Request & { user: { id: string } }) {
    const user = await this.userService.findById(req.user.id);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      prefs: user.pref
        ? {
            theme: user.pref.theme,
            accent: user.pref.accent,
            density: user.pref.density,
            targetLanguageId: user.pref.targetLanguageId,
          }
        : null,
    };
  }

  @Put('prefs')
  async updatePrefs(
    @Req() req: Request & { user: { id: string } },
    @Body() body: { theme?: string; accent?: string; density?: string; targetLanguageId?: string | null },
  ) {
    const pref = await this.userService.updatePrefs(req.user.id, body);
    return {
      theme: pref.theme,
      accent: pref.accent,
      density: pref.density,
      targetLanguageId: pref.targetLanguageId,
    };
  }
}
