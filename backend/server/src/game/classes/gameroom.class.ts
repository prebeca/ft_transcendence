import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/create-game.dto";
import { PlayerInfo } from "../interfaces/playerinfo.interface";
import { PlayerClass } from "./player.class";

export enum GAMEROOMSTATUS { WAITING = "WAITING", FULL = "FULL", INGAME = "INGAME" };

@Injectable()
export class GameRoomClass {
	constructor() {
	}

	public mapPlayers: Map<string, PlayerClass> = new Map<string, PlayerClass>();
	public nbPlayer: number = 0;
	public roomname: string = null;
	public status: string = GAMEROOMSTATUS.WAITING;
	public difficulty: number = 0; // 1 (easy) - 3 (hard) - speed of ball and maybe height of pads

	setOptions(roomname: string, createGameDto: CreateGameDto) {
		this.difficulty = createGameDto.difficulty;
		this.roomname = roomname;
	}

	printSid(): void {
		for (let key of this.mapPlayers.keys()) {
			console.log("player: " + key);
		}
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
				username: user.username
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
