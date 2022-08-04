import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './chat/channels/channels.module';
import { SocketModule } from './chat/socket/socket.module';
import { FriendsModule } from './friends/friends.module';
import { GameModule } from './game/game.module';
import { LoggerMiddleware } from './logger.middleware';
import { TypeOrmConfigService } from './typeorm/typeorm.service';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
		AuthModule,
		UsersModule,
		ChannelsModule,
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
