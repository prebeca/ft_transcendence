import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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