import { User } from 'src/typeorm';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MessageData } from './message.entity';


// export class Message {
// 	type: string;
// 	user_id: number;
// 	username: string;
// 	channel_id: number;
// 	channel_name: string;
// 	content: string;
// }

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
		enum: ["public", "private", "protected"],
		default: "public",
	})
	scope: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	image_url: string;

	@ManyToOne(() => User)
	@JoinTable()
	owner: User

	// @Column("bigint", { default: [], array: true })
	// admin_ids: number[];

	@ManyToMany(() => User)
	@JoinTable()
	admins: User[]

	@ManyToMany(() => User)
	@JoinTable()
	invited: User[]

	// @Column("bigint", { default: [], array: true })
	// invited_ids: number[];

	@ManyToMany(() => User)
	@JoinTable()
	users: User[]

	// @Column("bigint", { default: [], array: true })
	// users_ids: number[];
}