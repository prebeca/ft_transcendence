import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controllers/game.controller';
import { GameRoomController } from './controllers/gameroom.controller';
import { GameRoomService } from './services/gameroom.service';

@Module({
  imports: [],
  controllers: [GameController, GameRoomController],
  providers: [
    GameService, GameRoomService
  ]
})
export class GameModule { }
