import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@Column()
	username_winner: string;

	@Column()
	username_looser: string;

	@ManyToOne(() => Player)
	@JoinColumn()
	looser: Player;

	@Column()
	score_winner: number;

	@Column()
	avatar_winner: string;

	@Column()
	avatar_looser: string;

	@Column()
	score_looser: number;

	@Column({ default: 0 })
	xp_winner: number;

	@Column({ default: 0 })
	xp_looser: number;

	@Column({ default: 0 })
	level_winner: number;

	@Column({ default: 0 })
	level_looser: number;

	@Column()
	date: string;

	@Column()
	time: string;
}
