import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config: ConfigService = app.get(ConfigService);

	app.use(cookieParser());
	app.enableCors({
		origin: config.get<string>('APPLICATION_REDIRECT_URI'),
		credentials: true
	});
	await app.listen(3000, () => {
		console.log('[API]', config.get<number>('BASE_URL'));
	});
}
bootstrap();
