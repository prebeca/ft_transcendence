import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controllers/game.controller';
import { GameRoomController } from './controllers/gameroom.controller';
import { GameRoomService } from './services/gameroom.service';
import { GameRoomClass, PlayerClass } from './classes/player.class';
import { GameRoomGateway } from './gateways/gameroom.gateway';

@Module({
  imports: [],
  controllers: [GameController, GameRoomController],
  providers: [
    GameRoomGateway, GameService, GameRoomService, GameRoomClass, PlayerClass
  ]
})
export class GameModule { }
