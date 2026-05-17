import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPrefEntity } from './entities/user-pref.entity';
import { UserService } from './user.service';
import { MeController } from './me.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserPrefEntity])],
  providers: [UserService],
  controllers: [MeController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
