import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export class Message {
	sender_id: number;
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
	scope: string;

	@Column({ nullable: true })
	image_url: string;

	@Column({ nullable: true })
	owner: number;

	@Column("bigint", { default: {}, array: true })
	admin_ids: number[];

	@Column("bigint", { default: {}, array: true })
	users_ids: number[];

	@Column("jsonb", { default: {}, array: true })
	messages: Message[];
}