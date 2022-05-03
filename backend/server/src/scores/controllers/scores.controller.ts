import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateScoreDto } from 'src/scores/scores.dto';
import { ScoresService } from 'src/scores/services/scores.service';

@Controller('scores')
export class ScoresController {
	constructor(private readonly scoreService: ScoresService) { }

	@Get()
	getScores() {
		return this.scoreService.getScores();
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createScores(@Body() createScoreDto: CreateScoreDto) {
		return this.scoreService.createScore(createScoreDto);
	}
}
