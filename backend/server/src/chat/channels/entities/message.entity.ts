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

	@Column({ unique: true })
	type: string;

	@Column({ unique: true })
	user_id: number;

	@Column({ unique: true })
	username: string;

	@Column({ unique: true })
	channel_id: number;

	@Column({ unique: true })
	channel_name: string;

	@Column({ unique: true })
	content: string;
}