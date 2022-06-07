import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }


	async getFriends(user: User): Promise<User[]> {
		return this.userRepository.find({ relations: ["friends"] });
	}

	async removeFriend(user: User, user_id_to_remove: number): Promise<void> {
		console.log(user.friends);
		const user_to_remove: User = await this.userRepository.findOne(user_id_to_remove);
		user.friends = user.friends.slice(user.friends.indexOf(user_to_remove), 1);
		await this.userRepository.save(user);
		console.log(user.friends);
	}

	async addFriend(user: User, user_id_to_add: number): Promise<void> {
		console.log(user.friends);
		const user_to_add: User = await this.userRepository.findOne(user_id_to_add);
		user.friends = user.friends.slice(user.friends.push(user_to_add));
		await this.userRepository.save(user);
		console.log(user.friends);
	}
}
