import { Injectable } from '@nestjs/common';
import { GameRoomService } from './gameroom.service';

@Injectable()
export class GameService {
  constructor(
    private gameRoomService: GameRoomService
  ) { }

  //add a point to a player
  async addPoint(/* arg0: GameRoomClass*/): Promise<boolean> {
    /*
      add pt to player
      return 1 if all good
      return 0 if not
    */
    return true;
  }

  async gameFinished(/* arg0: GameRommClass*/) {
    /*
      add the result to DB, simple enough
      INSERT 1 in table game
      UPDATE 1 in table player
    */
    return;
  }
}
