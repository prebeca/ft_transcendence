import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/create-game.dto";
import BallI from "../interfaces/ballI.interface";
import GameI from "../interfaces/gameI.interface";
import PadI from "../interfaces/padI.interface";
import { PlayerInfo } from "../interfaces/playerinfo.interface";
import { PlayerClass } from "./player.class";

export enum GAMEROOMSTATUS { WAITING = "WAITING", FULL = "FULL", INGAME = "INGAME", ENDED = "ENDED" };

@Injectable()
export class GameRoomClass {
	constructor() {
	}

	public mapPlayers: Map<string, PlayerClass> = new Map<string, PlayerClass>();
	public nbPlayer: number = 0;
	public roomname: string = null;
	public status: string = GAMEROOMSTATUS.WAITING;
	public difficulty: number = 0;
	public begin_date: Date = null;
	public end_date: Date = null;
	public finished: boolean = false;
	public points: number = 0;

	public game: GameI = {
		gameWidth: 0,
		gameHeight: 0,
		pad1: {} as PadI,
		pad2: {} as PadI,
		ball: {} as BallI,
		score1: 0,
		score2: 0,
		looserPoint: "",
		status: ""
	};

	setOptions(roomname: string, createGameDto: CreateGameDto) {
		this.difficulty = createGameDto.difficulty;
		this.points = createGameDto.points;
		this.roomname = roomname;
	}

	printSid(): void {
		for (let key of this.mapPlayers.keys()) {
			console.log("player: " + key);
		}
	}

	getGame(): GameI {
		return this.game;
	}

	getDifficulty(): number {
		return this.difficulty;
	}

	getPoints(): number {
		return this.points;
	}

	getPlayerById(player_id: string): PlayerClass {
		for (const [sid, player] of this.mapPlayers) {
			if (sid === player_id)
				return player;
		}
		return null;
	}

	getPlayerInfoById(player_id: string): PlayerInfo {
		for (const [sid, player] of this.mapPlayers) {
			if (sid === player_id)
				return {
					player_number: player.player_number,
					username: player.username,
					userid: player.userid,
					avatar: player.avatar,
					level: player.level,
					losses: player.losses,
					wins: player.wins,
					mmr: player.mmr,
				};
		}
		return null;
	}

	getPlayers(): string[] {
		let players: string[] = [];
		for (const [sid, player] of this.mapPlayers) {
			players.push(player.username);
		}
		return players;
	}

	getPlayersId(): string[] {
		let players_id: string[] = [];
		for (const [sid, player] of this.mapPlayers) {
			players_id.push(sid);
		}
		return players_id;
	}

	getPlayersAvatars(): string[] {
		let avatars: string[] = [];
		for (const [sid, player] of this.mapPlayers) {
			avatars.push(player.avatar);
		}
		return avatars;
	}

	removePlayerFromRoom(sid: string): void {
		this.deletePlayer(sid);
	}

	deletePlayer(sid: string): void {
		if (this.mapPlayers.delete(sid) === true) {
			this.nbPlayer--;
		}
	}

	addPlayerToRoom(sid: string, user: User): void {
		if (this.nbPlayer < 2) {
			this.nbPlayer += 1;
			let player: PlayerClass = new PlayerClass();
			let player_number: number = 1;
			for (const [socketid, player] of this.mapPlayers) {
				player_number = (player.player_number === 1) ? 2 : 1;
				break;
			}
			player = {
				player_number: player_number,
				userid: user.id,
				avatar: user.avatar,
				level: user.player.level,
				wins: user.player.winnings,
				losses: user.player.losses,
				mmr: user.player.mmr,
				username: user.username,
				score: 0
			};
			this.mapPlayers.set(sid, player);
			this.printSid();
		}
		else {
			console.log("already 2 players");
		}
	}

	clearPlayers(): void {
		this.mapPlayers.clear();
	}
}
