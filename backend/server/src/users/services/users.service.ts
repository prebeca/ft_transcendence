import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/dto/users.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) { }

	getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async createUser(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto);
		console.log(newUser);
		return this.userRepository.save(newUser);
	}

	findUsersById(id: number): Promise<User> {
		return this.userRepository.findOne(id);
	}

	async remove(id: number): Promise<User[]> {
		await this.userRepository.delete(id);
		return this.getUsers();
	}

	async removeAll(): Promise<User[]> {
		await this.userRepository.clear();
		return this.getUsers();
	}

	async findOne(user_name: string): Promise<User> {
		return this.userRepository.findOne({where: {login: user_name}});
	}
}
