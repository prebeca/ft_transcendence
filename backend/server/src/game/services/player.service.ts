import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerService {
	constructor(@InjectRepository(Player) private readonly playerRepository: Repository<Player>) { }

	findAll(): Promise<Player[]> {
		try {
			return this.playerRepository.find();
		} catch (error) {
			throw new HttpException("Query to find every users failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
