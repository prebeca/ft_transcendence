import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Score {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'score_id',
	})
	id: number;

	@Column({
        type: 'bigint',
		name: 'user_id',
		default: 0,
	})
	user_id: number;

	@Column({
        type: 'bigint',
        name: 'points',
		default: 0,
	})
	points: number;
}
