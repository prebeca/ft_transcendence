import { Exclude } from 'class-transformer';
import { Player } from 'src/game/entities/player.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'user_id',
	})
	id: number;

	@Column({ unique: true })
	login: string;

	@Exclude()
	@Column({ unique: true })
	email: string;

	@Column({ unique: true, nullable: true })
	refresh_token: string;

	@Column('text', { default: "default.png" })
	avatar: string;

	@Column({ unique: true, nullable: true })
	username: string;

	@Exclude()
	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	salt: string;

	@Column({ default: false })
	fortytwouser: boolean;

	@Column({ default: false })
	twofauser: boolean;

	@Column({ nullable: true })
	twofasecret: string

	@Column("bigint", { default: {}, array: true })
	channels: number[];

	@OneToOne(() => Player, {
		cascade: ["insert"],
	})

	@JoinColumn()
	player: Player;

	@ManyToMany(() => User)
	@JoinTable()
	friends: User[]
}