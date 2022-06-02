import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { GameRoomService } from '../services/gameroom.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGameDto } from '../dto/create-game.dto';

@Controller('gameroom')
export class GameRoomController {
	constructor(private readonly gameRoomService: GameRoomService) { }

	@UseGuards(JwtAuthGuard)
	@Post('create')
	create(@Body() createGameDto: CreateGameDto, @Req() req: Request): string {
		const nameroom: string = this.gameRoomService.addRoom(createGameDto)
		console.log(nameroom);
		return nameroom;
	}

	@UseGuards(JwtAuthGuard)
	@Get('list')
	list(): { roomname: string, player1: string, player2: string }[] {
		const rooms: string[] = this.gameRoomService.getRooms();
		const ppr: { roomname: string, player1: string, player2: string }[] = this.gameRoomService.getPlayersInRooms();
		return ppr;
	}

	@Get('clear')
	clear(): void {
		return this.gameRoomService.clear();
	}
}