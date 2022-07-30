import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayerClass {
	constructor() {
	}
	public player_number: number = 0;
	public username: string = "";
	public userid: number = 0;
	public avatar: string = "";
	public losses: number = 0;
	public wins: number = 0;
	public mmr: number = 0;
	public level: number = 0;
	public score: number = 0;

}
