import { CreateDateColumn, JoinTable, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/typeorm';
import { Channel } from 'src/typeorm';

@Entity()
export class Mute {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'mute_id',
	})
	id: number;

	@ManyToOne(() => User)
	@JoinTable()
	user: User;

	@ManyToOne(() => Channel)
	@JoinTable()
	channel: Channel;

	@CreateDateColumn()
	start: Date;

	@Column({ nullable: false })
	end: Date;

	@Column({ nullable: false })
	duration: number;
}