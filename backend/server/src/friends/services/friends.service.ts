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

	async removeFriend(): Promise<void> {
		return;
	}

	async addFriend(): Promise<void> {
		return;
	}
}
