import { Channel, User } from '../../../typeorm';
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'message_id',
	})
	id: number;

	@ManyToOne(() => Channel, Channel => Channel.messages, { onDelete: 'CASCADE' })
	@JoinColumn()
	channel: Channel

	@ManyToOne(() => User)
	@JoinTable()
	user: User

	@Column()
	content: string;

	@Column({ nullable: true })
	challenge: boolean;
}
