import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'user_id',
	})
	id: number;

	@Column({ unique: true })
	userid: number;

	@Column({ default: 0 })
	level: number;

	@Column({ default: 0 })
	losses: number;

	@Column({ default: 0 })
	winnings: number;

	@Column({ nullable: true })
	mmr: number;
}