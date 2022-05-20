import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult, UsingJoinColumnOnlyOnOneSideAllowedError } from 'typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import { getRepository } from "typeorm";

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async createUser(userDto: UserDto) {
		const newUser = this.userRepository.create(userDto);
		return await this.userRepository.save(newUser);
	}

	async findUsersById(id: number): Promise<User> {
		return this.userRepository.findOne(id);
	}

	//	async getUpdateQueryBuilder()
	async updateUsersById(userid: number, userDto: UserDto): Promise<User> {
		return this.userRepository.save({ userDto, id: userid });
	}

	async updateUsername(userid: number, new_username: string) {
		console.log("updateUsername in service (): " + userid);
		const a = await getRepository(User)
			.createQueryBuilder("user")
			.update(User)
			.set({
				username: new_username,
			})
			.where("id = :id", { id: userid })
			.printSql()
			.execute();
	}

	async updateAvatar(filename: string, userid: number): Promise<User> {
		console.log("updateAvatar in service (): " + userid);
		if (filename) {
			const fs = require('fs');
			const ancient_filename: string = await this.getAvatarUrl(userid);
			if (ancient_filename === null)
				return null;
			await getRepository(User)
				.createQueryBuilder("user")
				.update(User)
				.set({
					avatar: filename,
				})
				.where("id = :id", { id: userid })
				.printSql()
				.execute();
			if (ancient_filename !== 'default.png') {

				if (fs.existsSync('src/avatar/' + ancient_filename)) {
					fs.unlinkSync('src/avatar/' + ancient_filename);
				}
			}
		}
		return await this.userRepository.findOne(userid);
	}

	async updateTwoFAUser(userid: number, istwofa: boolean): Promise<boolean> {
		const ret: UpdateResult = await getRepository(User)
			.createQueryBuilder("user")
			.update(User)
			.set({
				twofauser: istwofa,
			})
			.where("id = :id", { id: userid })
			.printSql()
			.execute();
		if (ret)
			return istwofa;
		return !istwofa; //no good if not checked on frontend
	}

	async getAvatarUrl(userid: number): Promise<string> {
		var avatar_url: string = (await this.userRepository.findOne(userid)).avatar;
		return avatar_url;
	}

	async remove(id: number): Promise<User[]> {
		await this.userRepository.delete(id);
		return this.getUsers();
	}

	async removeAll(): Promise<User[]> {
		await this.userRepository.clear();
		return this.getUsers();
	}

	async findOne(login_user: string): Promise<User> {
		return this.userRepository.findOne({ where: { login: login_user } });
	}

	async findOneByEmail(email_user: string): Promise<User> {
		return this.userRepository.findOne({ where: { email: email_user } });
	}

	async addChannel(user_id: number, chan_id: number) {
		let user = await this.userRepository.findOne(user_id);
		if (user == null)
			return
		if (user.channels.find((e) => e == chan_id) === undefined) {
			user.channels.push(chan_id)
		}
		this.userRepository.save(user);
	}
}
