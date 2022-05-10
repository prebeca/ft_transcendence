import { User } from 'src/typeorm';
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
	public: boolean;

	@Column()
	image_url: string;

	@Column()
	owner: number;

	@Column("bigint", { array: true })
	admin_ids: number[];

	@Column("bigint", { array: true })
	users_ids: number[];

}