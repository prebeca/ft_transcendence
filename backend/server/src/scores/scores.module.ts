import { Module } from '@nestjs/common';
import { ScoresController } from './controllers/scores.controller';
import { ScoresService } from './services/scores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Score])],
	controllers: [ScoresController],
	providers: [ScoresService]
})
export class ScoresModule { }
