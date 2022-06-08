import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }


	getFriends(user: User): User[] {
		return user.friends;
	}

	async removeFriend(user: User, user_id_to_remove: number): Promise<void> {
		const user_to_remove: User = await this.userRepository.findOne(user_id_to_remove);
		if (!user_to_remove || user.id === user_to_remove.id || this.isFriend(user, user_to_remove) === false)
			return;
		user.friends = user.friends.filter(function (value, index, arr) {
			return value.id !== user_id_to_remove;
		});
		await this.userRepository.save(user);
		console.log(user.friends);
	}

	isFriend(user: User, other_user: User): boolean {
		if (user.friends.find(usert => usert.id === other_user.id)) {
			console.log("other_user is present in friends from user");
			return true;
		}
		console.log("other_user is not present in friends from user");
		return false;
	}

	async addFriend(user: User, user_id_to_add: number): Promise<void> {
		const user_to_add: User = await this.userRepository.findOne(user_id_to_add);
		if (!user_to_add || user.id === user_to_add.id || this.isFriend(user, user_to_add))
			return;
		user.friends.push(user_to_add);
		await this.userRepository.save(user);
		console.log(user.friends);
	}
}
