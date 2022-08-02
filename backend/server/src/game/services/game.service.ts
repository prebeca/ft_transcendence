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
	xp_winner: number;
	xp_looser: number;
	level_winner: number;
	level_looser: number;
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

	calculate_new_xp(xp: number, level: number, goals: number, difficulty: string, mmr: number, winner: boolean): { new_xp: number, new_level: number, new_mmr: number } {
		let new_xp: number = xp;
		let new_level: number = level;
		let diff: number = 0;
		let new_mmr: number = mmr;
		switch (difficulty) {
			case "Easy":
				diff = 1;
			case "Medium":
				diff = 2;
			case "Hard":
				diff = 3;
		}

		if (winner) {
			new_xp += (100 + diff * 10);
			new_mmr += 30;
		} else {
			new_mmr -= 30;
			new_xp += (25 + diff * 10);
		}
		new_xp += goals * 10;
		for (; new_xp >= new_level * 200;) {
			new_xp -= new_level * 200;
			new_level += 1;
		}
		return {
			new_xp: new_xp,
			new_level: new_level,
			new_mmr: new_mmr
		};
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
		let xps: number[] = [];
		let levels: number[] = [];
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

		xps[0] = ps[0].xp;
		levels[0] = ps[0].level;
		xps[1] = ps[1].xp;
		levels[1] = ps[1].level;

		if (game.status === GameStatus.PLAYER1WON || game.status === GameStatus.PLAYER2LEAVE) {
			let new_infos_p1: { new_xp: number, new_level: number, new_mmr: number } = this.calculate_new_xp(xps[0], levels[0], game.score1, gameRoom.difficulty, ps[0].mmr, true);
			let new_infos_p2: { new_xp: number, new_level: number, new_mmr: number } = this.calculate_new_xp(xps[1], levels[1], game.score2, gameRoom.difficulty, ps[1].mmr, false);
			console.log(new_infos_p1);
			console.log(new_infos_p2);
			this.playerRepository.save({ ...ps[0], xp: new_infos_p1.new_xp, level: new_infos_p1.new_level, winnings: players[0].wins + 1, mmr: new_infos_p1.new_mmr });
			this.playerRepository.save({ ...ps[1], xp: new_infos_p2.new_xp, level: new_infos_p2.new_level, losses: players[1].losses + 1, mmr: new_infos_p2.new_mmr });
			gameDto = { ...gameDto, winner: ps[0], looser: ps[1], score_winner: game.score1, score_looser: game.score2, xp_winner: xps[0], xp_looser: xps[1], level_winner: levels[0], level_looser: levels[1] };
		}
		else {
			let new_infos_p1: { new_xp: number, new_level: number, new_mmr: number } = this.calculate_new_xp(xps[0], levels[0], game.score1, gameRoom.difficulty, ps[0].mmr, false);
			let new_infos_p2: { new_xp: number, new_level: number, new_mmr: number } = this.calculate_new_xp(xps[1], levels[1], game.score2, gameRoom.difficulty, ps[1].mmr, true);
			console.log(new_infos_p1);
			console.log(new_infos_p2);
			this.playerRepository.save({ ...ps[1], xp: new_infos_p2.new_xp, level: new_infos_p2.new_level, winnings: players[1].wins + 1, mmr: new_infos_p2.new_mmr });
			this.playerRepository.save({ ...ps[0], xp: new_infos_p1.new_xp, level: new_infos_p1.new_level, losses: players[0].losses + 1, mmr: new_infos_p1.new_mmr });
			gameDto = { ...gameDto, winner: ps[1], looser: ps[0], score_winner: game.score2, score_looser: game.score1, xp_winner: xps[1], xp_looser: xps[0], level_winner: levels[1], level_looser: levels[0] };
		}
		const new_game: Game = this.gameRepository.create(gameDto);
		this.gameRepository.save(new_game);
		this.gameRoomService.deleteRoom(id);
	}
}
