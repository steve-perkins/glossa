import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({ origin: webOrigin, credentials: true });

  const port = parseInt(process.env.API_PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}

bootstrap();
