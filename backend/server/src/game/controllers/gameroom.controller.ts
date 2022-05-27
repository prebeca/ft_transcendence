import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { GameRoomService } from '../services/gameroom.service';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';

@Controller('gameroom')
export class GameRoomController {
	constructor(private readonly gameRoomService: GameRoomService) { }

	@Get('create')
	creation(@Req() request: Request): string {
		var name: string = uuid();
		this.gameRoomService.addRoom(name);
		return (uuid());
	}

	@Get('list')
	list(): string[] {
		return this.gameRoomService.getRooms();
	}

	@Get('clear')
	clear(): void {
		return this.gameRoomService.clear();
	}
}