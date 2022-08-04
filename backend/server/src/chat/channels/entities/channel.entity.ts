import { Ban, Mute, User } from 'src/typeorm';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Channel {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'channel_id',
	})
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({
		type: "enum",
		enum: ["public", "private", "protected", "dm"],
		default: "public",
	})
	scope: string;

	@Column({ nullable: true })
	password: string;

	@ManyToOne(() => User)
	@JoinTable()
	owner: User

	@ManyToMany(() => User)
	@JoinTable()
	admins: User[]

	@ManyToMany(() => User)
	@JoinTable()
	invited: User[]

	@OneToMany(() => Ban, Ban => Ban.channel)
	@JoinTable()
	banned: Ban[]

	@OneToMany(() => Mute, Mute => Mute.channel)
	@JoinTable()
	muted: Mute[]

	@OneToMany(() => Message, Message => Message.channel)
	@JoinColumn()
	messages: Message[]

	@ManyToMany(() => User)
	@JoinTable()
	users: User[]
}
