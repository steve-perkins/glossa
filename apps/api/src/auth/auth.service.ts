import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { UserEntity } from '../user/entities/user.entity';
import { UserPrefEntity } from '../user/entities/user-pref.entity';

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserPrefEntity) private readonly prefRepo: Repository<UserPrefEntity>,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async validateGoogleToken(idToken: string): Promise<GoogleProfile> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new UnauthorizedException('Google sign-in not configured');
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: clientId });
      const p = ticket.getPayload();
      if (!p) throw new Error('Empty payload');
      return { sub: p.sub, email: p.email ?? '', name: p.name ?? '', picture: p.picture ?? '' };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async login(profile: GoogleProfile): Promise<{ accessToken: string; refreshToken: string }> {
    let user = await this.userRepo.findOneBy({ googleSub: profile.sub });
    if (!user) {
      user = await this.userRepo.save(
        this.userRepo.create({
          googleSub: profile.sub,
          email: profile.email,
          displayName: profile.name,
          avatarUrl: profile.picture || null,
        }),
      );
      await this.prefRepo.save(this.prefRepo.create({ userId: user.id }));
    } else {
      user.email = profile.email;
      user.displayName = profile.name;
      user.avatarUrl = profile.picture || null;
      await this.userRepo.save(user);
    }
    return this.issueTokens(user.id);
  }

  async refreshAccess(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify<{ sub: string; type: string }>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('User not found');
    return this.issueTokens(user.id);
  }

  private issueTokens(userId: string): { accessToken: string; refreshToken: string } {
    const secret = this.configService.get<string>('JWT_SECRET', 'changeme');
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { secret, expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { secret, expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }
}
