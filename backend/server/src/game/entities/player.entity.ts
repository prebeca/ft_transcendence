import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'player_id',
	})
	id: number;

	@Column({ default: 0 })
	level: number;

	@Column({ default: 0 })
	losses: number;

	@Column({ default: 0 })
	winnings: number;

	@Column({ default: 0 })
	mmr: number;

	@Column({ default: 0 })
	xp: number;
}