import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { CreateGameDto } from "../dto/create-game.dto";
import { PlayerClass } from "./player.class";

@Injectable()
export class GameRoomClass {
	constructor() {
	}

	public mapPlayers = new Map<string, PlayerClass>();
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

	addPlayerToRoom(sid: string, user: User): void {
		if (this.nbPlayer < 2) {
			this.nbPlayer += 1;
			let player: PlayerClass = new PlayerClass();
			player.player_number = this.nbPlayer;
			player.userid = user.id;
			player.avatar = user.avatar;
			player.level = user.player.level;
			player.wins = user.player.winnings;
			player.losses = user.player.losses;
			player.mmr = user.player.mmr;
			player.username = user.username;
			this.mapPlayers.set(sid, player);
			this.printSid();
		}
		else {
			console.log("already 2 players");
		}
	}

	deletePlayer(sid: string): void {
		this.mapPlayers.delete(sid);
		this.printSid();
	}

	clearPlayers(): void {
		this.mapPlayers.clear();
	}
}
