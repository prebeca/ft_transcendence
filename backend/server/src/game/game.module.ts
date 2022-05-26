import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameController } from './controllers/game.controller';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [
    GameService,
  ]
})
export class GameModule {}
