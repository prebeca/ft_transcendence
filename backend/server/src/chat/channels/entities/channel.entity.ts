import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export class Message {
	sender_id: bigint;
	channel: string;
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

	@Column("bigint", { nullable: true, array: true })
	admin_ids: number[];

	@Column("bigint", { nullable: true, array: true })
	users_ids: number[];

	@Column("jsonb", { nullable: true, array: true })
	messages: Message[];
}