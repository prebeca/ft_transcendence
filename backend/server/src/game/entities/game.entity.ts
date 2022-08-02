import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToMany, JoinTable, OneToOne, ManyToOne } from "typeorm";
import { Player } from "./player.entity";

@Entity()
export class Game {

	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'game_id',
	})
	id: number;

	@Column()
	uuid: string;

	@ManyToOne(() => Player)
	@JoinColumn()
	winner: Player;

	@ManyToOne(() => Player)
	@JoinColumn()
	looser: Player;

	@Column()
	score_winner: number;

	@Column()
	score_looser: number;

	@Column()
	date: string;

	@Column()
	time: string;
}
