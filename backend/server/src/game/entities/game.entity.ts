import { Entity, Column, PrimaryGeneratedColumn  } from "typeorm";

export enum GameStatus {
	WAITING = "waiting",
	PLAYING = "playing",
	ENDED = "ENDED",
}

@Entity()
export class Game {

	@PrimaryGeneratedColumn("uuid")
	gameId: number;

	@Column()
	player1: string;

	@Column()
	player2: string;

	@Column()
	scoreP1: string;

	@Column()
	scoreP2: string;

	@Column()
	winner: string;

	@Column()
	looser: string;

	@Column()
	date: string;

	@Column()
	time: number;

	@Column({ type: "enum", enum: GameStatus, default: GameStatus.WAITING })
	statut: GameStatus;

	@Column("simple-array")
	spectator: string[];

}
