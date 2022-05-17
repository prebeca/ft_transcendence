import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config: ConfigService = app.get(ConfigService);
	const swagger_config = new DocumentBuilder()
		.setTitle('Transcendence')
		.setDescription('The backend of our Transcendence project')
		.setVersion('0.1')
		.addTag('pong')
		.build();

	const document = SwaggerModule.createDocument(app, swagger_config);
	SwaggerModule.setup('api', app, document);

	app.use(cookieParser());
	app.enableCors({
		origin: config.get<string>('APPLICATION_REDIRECT_URI'),
		credentials: true
	});
	await app.listen(3000, () => {
		console.log('[WEB]', config.get<number>('BASE_URL'));
	});
}
bootstrap();
