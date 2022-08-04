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

	removeDataFromFriends(element, index: number, array: User[]) {
		element.email = undefined;
		element.channels = undefined;
		element.blocked = undefined;
	}

	getFriends(user: User): User[] {
		var friends: User[] = user.friends;
		friends.forEach(this.removeDataFromFriends);
		return friends;
	}

	async removeFriend(user: User, user_id_to_remove: number): Promise<void> {
		const user_to_remove: User = await this.userRepository.findOne(user_id_to_remove);
		if (!user_to_remove || user.id === user_to_remove.id || this.isFriend(user, user_to_remove) === false)
			return;
		user.friends = user.friends.filter(function (value, index, arr) {
			return value.id !== user_id_to_remove;
		});
		await this.userRepository.save(user);
	}

	isFriend(user: User, other_user: User): boolean {
		if (user.friends.find(usert => usert.id === other_user.id)) {
			return true;
		}
		return false;
	}

	async addFriend(user: User, user_id_to_add: number): Promise<void> {
		const blocked: User[] = (await this.userRepository.findOne(user.id, { relations: ["blocked"] })).blocked;
		const user_to_add: User = await this.userRepository.findOne(user_id_to_add, { relations: ["blocked"] });
		if (!user_to_add || user.id === user_to_add.id || this.isFriend(user, user_to_add))
			return;
		if (blocked.find(e => { return e.id == user_to_add.id }) != undefined)
			return;

		if (user_to_add.blocked.find(e => { return e.id == user.id }) != undefined)
			return;
		user.friends.push(user_to_add);
		await this.userRepository.save(user);
	}
}
