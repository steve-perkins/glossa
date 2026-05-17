import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const REFRESH_COOKIE = 'glossa_refresh';
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleSignIn(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!idToken) throw new UnauthorizedException('idToken required');
    const profile = await this.authService.validateGoogleToken(idToken);
    const { accessToken, refreshToken } = await this.authService.login(profile);
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new UnauthorizedException('No refresh token');
    const { accessToken, refreshToken } = await this.authService.refreshAccess(token);
    setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }
}
