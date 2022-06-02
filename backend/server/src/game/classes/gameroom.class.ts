import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/create-game.dto";
import { PlayerClass } from "./player.class";

@Injectable()
export class GameRoomClass {
	constructor() {
	}

	public mapPlayers: Map<string, PlayerClass> = new Map<string, PlayerClass>();
	public nbPlayer: number = 0;
	public roomname: string = null;

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

	getPlayers(): string[] {
		let players: string[] = [];
		for (const [sid, player] of this.mapPlayers) {
			players.push(player.username);
		}
		return players;
	}

	removePlayerFromRoom(sid: string): void {
		this.deletePlayer(sid);
	}

	addPlayerToRoom(sid: string, user: User): void {
		if (this.nbPlayer < 2) {
			this.nbPlayer += 1;
			let player: PlayerClass = new PlayerClass();
			player = {
				player_number: this.nbPlayer,
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

	deletePlayer(sid: string): void {
		if (this.mapPlayers.delete(sid) === true) {
			this.nbPlayer--;
		}
		this.printSid();
	}

	clearPlayers(): void {
		this.mapPlayers.clear();
	}
}
