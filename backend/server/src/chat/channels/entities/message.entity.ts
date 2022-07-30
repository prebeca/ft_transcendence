import { Channel, User } from 'src/typeorm';
import { JoinTable, JoinColumn, Column, Entity, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

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
}