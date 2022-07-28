import { Channel, User } from 'src/typeorm';
import { JoinTable, Column, Entity, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class Message {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'message_id',
	})
	id: number;

	@ManyToOne(() => Channel)
	@JoinTable()
	channel: Channel

	@ManyToOne(() => User)
	@JoinTable()
	user: User

	@Column()
	content: string;
}