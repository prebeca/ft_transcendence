/*
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
	consumer
	  .apply(LoggerMiddleware)
	  .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}*/
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
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './chat/channels/channels.module';
import { GameModule } from './game/game.module';
import { GameGateway } from './game/game.gateway';
import { MessageGateway } from './messages/messages.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({useClass: TypeOrmConfigService}),
    AuthModule,
    UsersModule,
    ChannelsModule,
	  ScoresModule,
	  MessagesModule,
	  GameModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GameGateway,
    MessageGateway
  ],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes({ path: '*', method: RequestMethod.ALL });
	}
}
