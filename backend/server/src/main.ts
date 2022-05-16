/*import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

/*
** Uses NestFactory class that exposes a few static methodsfor creating application instances
** .create() -> returns an application object
**
** This piece of code simpy starts an HTTP listener (it is waiting for HTTP Request)
*/
/*
async function bootstrap() {
	const app: NestExpressApplication = await NestFactory.create(AppModule);
	const config: ConfigService = app.get(ConfigService);
	const port: number = config.get<number>('3000');

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, () => {
		console.log('[WEB]', config.get<string>('BASE_URL'));
	});
}

bootstrap();
*/

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
	origin: 'http://localhost:8080',
	credentials: true
  });
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
