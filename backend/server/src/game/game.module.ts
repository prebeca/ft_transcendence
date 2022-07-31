import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameRoomController } from './controllers/gameroom.controller';
import { GameRoomService } from './services/gameroom.service';
import { GameRoomGateway } from './gateways/gameroom.gateway';
import { GameRoomClass } from './classes/gameroom.class';
import { PlayerClass } from './classes/player.class';
import { PlayerController } from './controllers/player.controller';
import { PlayerService } from './services/player.service';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './gateways/game.gateway';
import { UsersModule } from 'src/users/users.module';
import { Game } from './entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Game]),
    UsersModule,
  ],
  controllers: [GameRoomController, PlayerController],
  providers: [
    GameService, GameRoomGateway, GameGateway, GameRoomService, PlayerService, GameRoomClass, PlayerClass
  ]
})
export class GameModule { }
