import { Injectable } from '@nestjs/common';
import { GameRoomService } from './gameroom.service';

@Injectable()
export class GameService {
  constructor(
    private gameRoomService: GameRoomService
  ) { }

  async gameFinished(/* arg0: GameRommClass*/) {
    /*
      add the result to DB, simple enough
      INSERT 1 in table game
      UPDATE 1 in table player
    */
    return;
  }
}
