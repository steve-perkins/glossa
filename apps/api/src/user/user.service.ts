import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPrefEntity } from './entities/user-pref.entity';

export interface UpdatePrefsDto {
  theme?: string;
  accent?: string;
  density?: string;
  targetLanguageId?: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserPrefEntity) private readonly prefRepo: Repository<UserPrefEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity & { pref: UserPrefEntity | null }> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['pref'] });
    if (!user) throw new NotFoundException('User not found');
    return user as UserEntity & { pref: UserPrefEntity | null };
  }

  async updatePrefs(userId: string, dto: UpdatePrefsDto): Promise<UserPrefEntity> {
    let pref = await this.prefRepo.findOneBy({ userId });
    if (!pref) {
      pref = this.prefRepo.create({ userId, ...dto });
    } else {
      if (dto.theme !== undefined) pref.theme = dto.theme;
      if (dto.accent !== undefined) pref.accent = dto.accent;
      if (dto.density !== undefined) pref.density = dto.density;
      if ('targetLanguageId' in dto) pref.targetLanguageId = dto.targetLanguageId ?? null;
    }
    return this.prefRepo.save(pref);
  }
}
