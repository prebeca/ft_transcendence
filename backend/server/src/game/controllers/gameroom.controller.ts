import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { GameRoomService } from '../services/gameroom.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateGameDto } from '../dto/create-game.dto';
import { GameRoomClass } from '../classes/gameroom.class';
import { User } from 'src/users/entities/user.entity';

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
	list(): { roomname: string, player1: string, avatar1: string, player2: string, avatar2: string }[] {
		return this.gameRoomService.getPlayersInRooms();
	}

	@Get('clear')
	clear(): void {
		return this.gameRoomService.clear();
	}

	/*
	** 1. get all rooms & filter them to the ones who are not full (in gameRoomService)
	** 2. take the one where the mmr is the closest
	** 3. return the name of it
	*/
	@UseGuards(JwtAuthGuard)
	@Get('matchmaking')
	matchmake(@Req() req: Request): string {
		const user: User = { ...req.user as User };

		const rooms: string[] = this.gameRoomService.getRoomsNotFull();
		console.log(rooms);
		if (rooms.length === 0) {
			return this.gameRoomService.addRoom({ difficulty: 2 });
		}
		else if (rooms.length === 1) //join the only one created
		{
			return rooms[0];
		} else {
			const players_mmr: number[] = [];
			const players_id: string[] = [];
			for (var i: number = 0; i < rooms.length; i++) {
				var gameRoom: GameRoomClass = this.gameRoomService.getRoomById(rooms[i]);
				players_id.push(gameRoom.getPlayersId()[0]);
				players_mmr.push(gameRoom.getPlayerById(players_id[i]).mmr);
			}
			const current_mmr: number = user.player.mmr;
			var x: number = current_mmr;
			var index_closest: number = -1;
			for (var i: number = 0; i < players_mmr.length; i++) {
				let diff: number = players_mmr[i] - current_mmr;
				diff = (diff < 0) ? diff * -1 : diff;
				if (diff <= x) {
					x = players_mmr[i];
					index_closest = i;
				}
			}
			console.log(index_closest);
			return (this.gameRoomService.getRoomNameByPlayerId(players_id[index_closest]));
		}
	}
}