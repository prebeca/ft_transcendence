import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from '../services/player.service';

@Controller('players')
export class PlayerController {
	constructor(private readonly playerService: PlayerService) { }

	@Get()
	findAll(): Promise<Player[]> {
		return this.playerService.findAll();
	}
}
