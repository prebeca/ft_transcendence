import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { GameRoomService } from '../services/gameroom.service';
import { Request } from 'express';
import { JwtTwoFactorAuthGuard } from 'src/auth/guards/jwt-twofa.guard';
import { CreateGameDto } from '../dto/create-game.dto';
import { User } from 'src/users/entities/user.entity';
import GameRoomInterface from '../interfaces/gameroom.interface';

@Controller('gameroom')
export class GameRoomController {
	constructor(private readonly gameRoomService: GameRoomService) { }

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('create')
	create(@Body() createGameDto: CreateGameDto, @Req() req: Request): string {
		const nameroom: string = this.gameRoomService.addRoom(createGameDto)
		console.log("nameroom = " + nameroom);
		console.log("reqqqqqq = " + JSON.stringify(req.body));
		return nameroom;
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('list')
	list(): GameRoomInterface[] {
		return this.gameRoomService.getPlayersInRooms();
	}

	@Get('clear')
	clear(): void {
		return this.gameRoomService.clear();
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('matchmaking')
	matchmake(@Req() req: Request): string {
		const user: User = { ...req.user as User };
		return this.gameRoomService.findRoom(user);
	}
}
