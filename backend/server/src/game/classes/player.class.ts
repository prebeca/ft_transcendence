import { Injectable } from "@nestjs/common";

export class PlayerClass {
	constructor(public sid: string) {
		this.id = sid;
	}
	public id: string;

}

@Injectable()
export class GameRoomClass {
	constructor() { }
	mapPlayers = new Map<string, PlayerClass>();
	nbPlayer: number = 0;

	printKey(): void {
		for (let key of this.mapPlayers.keys()) {
			console.log("player: " + key);
		}
	}
	addPlayerToRoom(sid: string): void {
		this.mapPlayers.set(sid, new PlayerClass(sid));
		this.printKey();
	}
	deletePlayer(sid: string): void {
		this.mapPlayers.delete(sid);
		this.printKey();
	}
	clearPlayers(): void {
		this.mapPlayers.clear();
	}
}
