import { Message } from 'src/chat/channels/entities/message.entity';
import { Player } from 'src/game/entities/player.entity';
import { Channel } from 'src/typeorm';
import { OneToMany, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'user_id',
	})
	id: number;

	@Column({ select: false, unique: true })
	login: string;

	@Column({ unique: true })
	email: string;

	@Column({ select: false, unique: true, nullable: true })
	refresh_token: string;

	@Column('text', { default: "default.png" })
	avatar: string;

	@Column({ unique: true, nullable: true })
	username: string;

	@Column({ select: false, nullable: true })
	password: string;

	@Column({ select: false, nullable: true })
	salt: string;

	@Column({ select: false, default: false })
	fortytwouser: boolean;

	@Column({ select: false, default: false })
	twofauser: boolean;

	@Column({ select: false, nullable: true })
	twofasecret: string

	@ManyToMany(() => Channel)
	@JoinTable()
	channels: Channel[]

	@OneToOne(() => Player, {
		cascade: ["insert"],
	})
	@JoinColumn()
	player: Player;

	@ManyToMany(() => User)
	@JoinTable()
	friends: User[]

	@ManyToMany(() => User)
	@JoinTable()
	blocked: User[]

	@OneToMany(() => Message, Message => Message.user)
	@JoinTable()
	message: Message[]

	@Column({ nullable: true, default: null })
	socket_id: string
}