import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ContentModule } from './content/content.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProgressModule } from './progress/progress.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // npm workspaces sets cwd to apps/api/ when running dev scripts,
      // so the monorepo .env is two levels up. In production, env vars
      // are injected directly (Docker ENV) and no .env file is needed.
      envFilePath: ['../../.env', '.env'],
    }),
    DatabaseModule,
    ContentModule,
    AuthModule,
    UserModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
