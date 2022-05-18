import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'user_id',
	})
	id: number;

	@Column({ unique: true })
	login: string;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	access_token: string;

	@Column({ unique: true })
	refresh_token: string;

	@Column()
	scope: string;

	@Column()
	expires_in: number;

	@Column()
	created_at: number;

	@Column('text', { default: "empty" })
	avatar: string;

	@Column({ unique: true })
	username: string;

	@Column("bigint", { default: {}, array: true })
	channels: number[];
}