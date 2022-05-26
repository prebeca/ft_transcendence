import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameRoomController } from './gameroom.controller';
import { GameRoomService } from './gameroom.service';

@Module({
  imports: [],
  controllers: [GameController, GameRoomController],
  providers: [
    GameService, GameRoomService
  ]
})
export class GameModule { }
