import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  app.use(cookieParser());
  app.enableCors({
	  origin: process.env.APPLICATION_REDIRECT_URI,
	  credentials: true
  });
  await app.listen(3000, () => {
	  console.log('[WEB]', config.get<number>('BASE_URL'));
	});
}
bootstrap();
