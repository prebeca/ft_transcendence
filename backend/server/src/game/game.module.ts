import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controllers/game.controller';
import { GameRoomController } from './controllers/gameroom.controller';
import { GameRoomService } from './services/gameroom.service';
import { GameRoomGateway } from './gateways/gameroom.gateway';
import { GameRoomClass } from './classes/gameroom.class';
import { PlayerClass } from './classes/player.class';
import { PlayerController } from './controllers/player.controller';
import { PlayerService } from './services/player.service';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player]),
  ],
  controllers: [GameController, GameRoomController, PlayerController],
  providers: [
    GameRoomGateway, GameService, GameRoomService, PlayerService, GameRoomClass, PlayerClass
  ]
})
export class GameModule { }
