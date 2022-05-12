import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Channel {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'channel_id',
	})
	id: number;

	@Column({ unique: true })
	name: string;

	@Column()
	scope: string;

	@Column()
	image_url: string;

	@Column()
	owner: number;

	@Column({ array: true })
	admin: number[];
}