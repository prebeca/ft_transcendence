import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './typeorm/typeorm.service';
import { LoggerMiddleware } from './logger.middleware';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScoresModule } from './scores/scores.module';
import { ChannelsModule } from './chat/channels/channels.module';
import { GameModule } from './game/game.module';
import { SocketModule } from './chat/socket/socket.module';
import { FriendsModule } from './friends/friends.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
		AuthModule,
		UsersModule,
		ChannelsModule,
		ScoresModule,
		GameModule,
		SocketModule,
		FriendsModule
	],
	controllers: [AppController],
	providers: [
		AppService,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
