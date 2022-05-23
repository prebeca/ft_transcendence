import { Injectable, InternalServerErrorException, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult, UsingJoinColumnOnlyOnOneSideAllowedError } from 'typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import { getRepository } from "typeorm";
import { createReadStream } from 'fs';
import { ReadStream } from 'typeorm/platform/PlatformTools';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	createUser(userDto: UserDto): User {
		try {
			const user: User = this.userRepository.create(userDto);
			return user;
		}
		catch (error) {
			throw new InternalServerErrorException("Creation of user failed");
		}
	}

	async findUsersById(id: number): Promise<User> {
		return this.userRepository.findOne(id);
	}

	//	async getUpdateQueryBuilder()
	async updateUsersById(userid: number, userDto: UserDto): Promise<User> {
		try {
			const user: User = await this.userRepository.save({ userDto, id: userid });
			return user;
		}
		catch (error) {
			throw new InternalServerErrorException("updateUsersById error");
		}
	}

	async updateUsername(user: User, new_username: string) {
		if (!new_username)
			throw new UnauthorizedException("Fill in the new username please");
		try {
			const a = await getRepository(User)
				.createQueryBuilder("user")
				.update(User)
				.set({
					username: new_username,
				})
				.where("id = :id", { id: user.id })
				.printSql()
				.execute();
		}
		catch (error) {
			throw new InternalServerErrorException("Update username does not work");
		}
	}

	async updateAvatar(filename: string, userid: number): Promise<User> {
		console.log("updateAvatar in service (): " + userid);
		if (filename) {
			const fs = require('fs');
			const ancient_filename: string = await this.getAvatarUrl(userid);
			if (ancient_filename === null)
				return null;
			try {
				await getRepository(User)
					.createQueryBuilder("user")
					.update(User)
					.set({
						avatar: filename,
					})
					.where("id = :id", { id: userid })
					.printSql()
					.execute();
			} catch (error) {
				throw new InternalServerErrorException("Update of avatar does not work");
			}
			if (ancient_filename !== 'default.png') {

				if (fs.existsSync('src/avatar/' + ancient_filename)) {
					fs.unlinkSync('src/avatar/' + ancient_filename);
				}
			}
		}
		return await this.userRepository.findOne(userid);
	}

	async updateTwoFAUser(userid: number, istwofa: boolean): Promise<boolean> {
		try {
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
		} catch (error) {
			throw new InternalServerErrorException("Update TwoFAUser not work");
		}
		return !istwofa; //no good if not checked on frontend
	}

	async getAvatarUrl(userid: number): Promise<string> {
		var avatar_url: string = (await this.userRepository.findOne(userid)).avatar;
		return avatar_url;
	}

	async getAvatar(filename: string): Promise<StreamableFile> {
		var file: ReadStream;
		var path_avatar = 'src/avatar/';
		const fs = require('fs');
		if (filename !== undefined) {
			path_avatar += filename;
			if (fs.existsSync(path_avatar)) {
				file = createReadStream(path_avatar);
				return new StreamableFile(file);
			}
		}
		path_avatar = 'src/avatar/default.png';
		if (fs.existsSync(path_avatar)) {
			file = createReadStream(path_avatar);
			return new StreamableFile(file);
		}
		return null;
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
		try {
			this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException("addChannel does not work");
		}
	}
}
