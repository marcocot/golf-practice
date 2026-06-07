import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';
import { Env } from '@/config/env.validation';

async function bootstrap(): Promise<void> {
  // Better Auth needs the raw request body; the integration re-adds parsers for other routes.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  app.useLogger(app.get(Logger));
  app.use(helmet());

  const config = app.get(ConfigService<Env, true>);
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })
  );
  app.setGlobalPrefix('api');

  await app.listen(config.get('API_PORT', { infer: true }));
}

bootstrap().catch((error) => {
  console.error('Failed to start the API', error);
  process.exit(1);
});
