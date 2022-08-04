import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtTwoFactorAuthGuard } from 'src/auth/guards/jwt-twofa.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateGameDto } from '../dto/create-game.dto';
import { Game } from '../entities/game.entity';
import GameRoomInterface from '../interfaces/gameroom.interface';
import { GameService } from '../services/game.service';
import { GameRoomService } from '../services/gameroom.service';

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

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('history/:playerid')
	async getHistoryByPlayerId(@Param('playerid') playerid: number): Promise<Game[]> {
		if (!playerid)
			return null;
		return await this.gameService.getHistoryByPlayerId(playerid);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('history')
	async getHistory(@Req() req: Request): Promise<Game[]> {
		const user: User = { ...req.user as User };
		return await this.gameService.getHistoryByUser(user);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
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
