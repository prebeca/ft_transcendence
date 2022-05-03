import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Score } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateScoreDto } from 'src/scores/scores.dto';

@Injectable()
export class ScoresService {
	constructor(
		@InjectRepository(Score) private readonly scoreRepository: Repository<Score>,
	) { }

	getScores() {
		return this.scoreRepository.find();
	}

	createScore(createScoreDto: CreateScoreDto) {
		const newscore = this.scoreRepository.create(createScoreDto);
		return this.scoreRepository.save(newscore);
	}
}