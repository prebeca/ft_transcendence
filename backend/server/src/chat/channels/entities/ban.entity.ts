import { CreateDateColumn, JoinTable, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/typeorm';
import { Channel } from 'src/typeorm';

@Entity()
export class Ban {
	@PrimaryGeneratedColumn({
		type: 'bigint',
		name: 'ban_id',
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