import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export class Message {
	type: string;
	user_id: number;
	username: string;
	channel_id: number;
	channel_name: string;
	content: string;
}

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

	@Column({ nullable: true })
	owner: number;

	@Column("bigint", { default: [], array: true })
	admin_ids: number[];

	@Column("bigint", { default: [], array: true })
	invited_ids: number[];

	@Column("bigint", { default: [], array: true })
	users_ids: number[];

	@Column("json", { default: [] })
	messages: Message[];
}