import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export class MessageData {
	type: string;
	user_id: number;
	username: string;
	channel_id: number;
	channel_name: string;
	content: string;
}

@Entity()
export class Message {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'message_id',
	})
	id: number;

	@Column()
	user_id: number;

	@Column()
	user_name: string;

	@Column()
	channel_id: number;

	@Column()
	content: string;
}