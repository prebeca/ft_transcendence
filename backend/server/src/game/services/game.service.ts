import { Injectable } from '@nestjs/common';
import { GameRoomClass, GAMEROOMSTATUS } from '../classes/gameroom.class';
import { Player } from '../entities/player.entity';
import GameI from '../interfaces/gameI.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { PlayerClass } from '../classes/player.class';
import { GameRoomService } from './gameroom.service';

export class GameDto {
	uuid: string;
	winner: Player;
	looser: Player;
	score_winner: number;
	score_looser: number;
	date: string;
	time: string;
}
export enum GameStatus {
	WAITING = "waiting",
	INCOMPLETE = "incomplete",
	INPROGRESS = "in progress",
	PLAYER1WON = "player 1 won",
	PLAYER2WON = "player 2 won",
	PLAYER1LEAVE = "player 2 won by forfeit",
	PLAYER2LEAVE = "player 1 won by forfeit",
	ENDED = "ended",
}
@Injectable()
export class GameService {
	constructor(private readonly gameRoomService: GameRoomService) { }

	@InjectRepository(Player)
	private readonly playerRepository: Repository<Player>
	@InjectRepository(Game)
	private readonly gameRepository: Repository<Game>

	async get_match_details(uuid: string) {
		const match: Game = await this.gameRepository.findOne({ uuid: uuid });
		return match;
	}

	async gameFinished(gameRoom: GameRoomClass, game: GameI, id: string) {
		if (gameRoom.finished === true)
			return;
		gameRoom.status = GAMEROOMSTATUS.ENDED;
		gameRoom.finished = true;
		gameRoom.end_date = new Date();
		gameRoom.end_date.toLocaleDateString();
		const diffTime: number = Math.abs((gameRoom.end_date.getTime() - gameRoom.begin_date.getTime()) / 1000);
		let gameDto = new GameDto();
		gameDto = { ...gameDto, uuid: id, date: gameRoom.end_date.toLocaleDateString(), time: diffTime.toString() };

		let players: PlayerClass[] = [];
		let ps: Player[] = [];

		for (const [sid, player] of gameRoom.mapPlayers) {
			players.push(player);
			let p: Player = await this.playerRepository.findOne({ id: player.userid });
			ps.push(p);
		}

		const p1first: boolean = (players[0].player_number === 1) ? true : false;
		if (!p1first) {
			let player_temp: Player = ps[0];
			ps[0] = ps[1];
			ps[1] = player_temp;
			let player_class_temp: PlayerClass = players[0];
			players[0] = players[1];
			players[1] = player_class_temp;
		}

		if (game.status === GameStatus.PLAYER1WON || game.status === GameStatus.PLAYER2LEAVE) {
			this.playerRepository.save({ ...ps[0], winnings: players[0].wins + 1 });
			this.playerRepository.save({ ...ps[1], losses: players[1].losses + 1 });
			gameDto = { ...gameDto, winner: ps[0], looser: ps[1], score_winner: game.score1, score_looser: game.score2 };
		}
		else {
			this.playerRepository.save({ ...ps[1], winnings: players[1].wins + 1 });
			this.playerRepository.save({ ...ps[0], losses: players[0].losses + 1 });
			gameDto = { ...gameDto, winner: ps[1], looser: ps[0], score_winner: game.score2, score_looser: game.score1 };
		}

		const new_game: Game = this.gameRepository.create(gameDto);
		this.gameRepository.save(new_game);
		this.gameRoomService.deleteRoom(id);
	}
}
