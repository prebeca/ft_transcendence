import { Injectable } from '@nestjs/common';
import { GameRoomClass } from '../classes/gameroom.class';
import { Player } from '../entities/player.entity';
import GameI from '../interfaces/gameI.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';

export enum GameStatus {
  WAITING = "waiting",
  INCOMPLETE = "incomplete",
  INPROGRESS = "in progress",
  PLAYER1WON = "player 1 won",
  PLAYER2WON = "player 2 won",
  PLAYER1LEAVE = "player 2 won by forfeit",
  PLAYER2LEAVE = "player 1 won by forfeit",
  ENDED = "ended",
}

@Injectable()
export class GameService {
  constructor() { }

  @InjectRepository(Player)
  private readonly playerRepository: Repository<Player>
  @InjectRepository(Game)
  private readonly gameRepository: Repository<Game>

  async gameFinished(gameRoom: GameRoomClass, game: GameI) {

    for (const [sid, player] of gameRoom.mapPlayers) {
      let p: Player = await this.playerRepository.findOne({ id: player.userid });
      if (player.player_number === 1 && game.status === GameStatus.PLAYER1WON)
        this.playerRepository.save({ ...p, winnings: player.wins + 1 });
      else if (player.player_number === 2 && game.status === GameStatus.PLAYER2WON)
        this.playerRepository.save({ ...p, winnings: player.wins + 1 });
      else
        this.playerRepository.save({ ...p, losses: player.losses + 1 });
    }
    return;
  }
}
