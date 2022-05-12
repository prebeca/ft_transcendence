import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import {getRepository} from "typeorm";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) { }

	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async createUser(userDto: UserDto) {
		const newUser = this.userRepository.create(userDto);
		console.log(newUser);
		return this.userRepository.save(newUser);
	}

	async findUsersById(id: number): Promise<User> {
		return this.userRepository.findOne(id);
	}

	async updateUsersById(userid: number, userDto: UserDto): Promise<User> {
		return this.userRepository.save({userDto, id: userid});
	}

	async updateUsername(userid: number, new_username: string) {
		console.log("updateUsername in service () " + userid);
		const a = await getRepository(User)
			.createQueryBuilder("user")
			.update(User)
			.set({
				username: new_username,
			})
			.where("id = :id", {id: userid})
			.printSql() 
			.execute();
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
