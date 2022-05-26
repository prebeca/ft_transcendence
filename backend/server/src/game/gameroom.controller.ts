import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GameRoomService } from './gameroom.service';

@Controller('gameroom')
export class GameRoomController {
	constructor(private readonly gameRoomService: GameRoomService) { }


	@Get()
	findAll() {
		return this.gameRoomService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.gameRoomService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.gameRoomService.remove(+id);
	}
}