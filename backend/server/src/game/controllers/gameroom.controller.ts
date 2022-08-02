import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { GameRoomService } from '../services/gameroom.service';
import { Request } from 'express';
import { JwtTwoFactorAuthGuard } from 'src/auth/guards/jwt-twofa.guard';
import { CreateGameDto } from '../dto/create-game.dto';
import { User } from 'src/users/entities/user.entity';
import GameRoomInterface from '../interfaces/gameroom.interface';
import { Game } from '../entities/game.entity';
import { GameService } from '../services/game.service';

@Controller('gameroom')
export class GameRoomController {
	constructor(
		private readonly gameRoomService: GameRoomService,
		private readonly gameService: GameService
	) { }

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('create')
	create(@Body() createGameDto: CreateGameDto, @Req() req: Request): string {
		const nameroom: string = this.gameRoomService.addRoom(createGameDto)
		return nameroom;
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('list')
	list(): GameRoomInterface[] {
		return this.gameRoomService.getPlayersInRooms();
	}

	@Get('details/:uuid')
	async match_details(@Param('uuid') uuid: string) {
		return await this.gameService.get_match_details(uuid);
	}

	@Get('all')
	all() {
		return (JSON.stringify(this.gameRoomService.rooms));
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
