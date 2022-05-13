import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [
    GameService,
  ]
})
export class GameModule {}
