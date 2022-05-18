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

	@Column({ unique: true, nullable: true })
	access_token: string;

	@Column({ unique: true, nullable: true })
	refresh_token: string;

	@Column({ nullable: true })
	scope: string;

	@Column({ nullable: true })
	expires_in: number;

	@Column({ nullable: true })
	created_at: number;

	@Column('text', { default: "default.png" })
	avatar: string;

	@Column({ unique: true })
	username: string;

	@Column({ nullable: true })
	password: string;

	@Column({ default: false })
	fortytwouser: boolean;

	@Column({ default: false })
	twofauser: boolean;

}