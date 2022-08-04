import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { GameRoomClass } from './classes/gameroom.class';
import { PlayerClass } from './classes/player.class';
import { GameRoomController } from './controllers/gameroom.controller';
import { PlayerController } from './controllers/player.controller';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { GameGateway } from './gateways/game.gateway';
import { GameRoomGateway } from './gateways/gameroom.gateway';
import { GameService } from './services/game.service';
import { GameRoomService } from './services/gameroom.service';
import { PlayerService } from './services/player.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Game, User]),
    UsersModule,
  ],
  controllers: [GameRoomController, PlayerController],
  providers: [
    GameService, GameRoomGateway, GameGateway, GameRoomService, PlayerService, GameRoomClass, PlayerClass
  ]
})
export class GameModule { }
