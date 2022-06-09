import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


export class MessageData {
	type: string;
	user_id: number;
	username: string;
	target_id: number;
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

	// target_id can be either channel_id or user_id
	@Column()
	target_id: number;

	@Column()
	content: string;
}