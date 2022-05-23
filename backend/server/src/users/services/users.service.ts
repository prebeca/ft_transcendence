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
		try {
			return this.userRepository.find();
		} catch (error) {
			throw new InternalServerErrorException("Query to find every users failed");
		}
	}

	createUser(userDto: UserDto): User {
		try {
			return this.userRepository.create(userDto);
		} catch (error) {
			throw new InternalServerErrorException("Creation of user failed");
		}
	}

	async findUsersById(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne(id);
			if (!(user as User))
				return null;
			return user as User;
		} catch (error) {
			throw new InternalServerErrorException("Query to find user failed");
		}
	}

	async updateUsersById(userid: number, userDto: UserDto): Promise<User> {
		try {
			const user: User = await this.userRepository.save({ userDto, id: userid });
			return user;
		}
		catch (error) {
			throw new InternalServerErrorException("updateUsersById error");
		}
	}

	async updateUsername(user: User, new_username: string): Promise<void> {
		if (!new_username)
			throw new UnauthorizedException("Fill in the new username please");
		try {
			await getRepository(User)
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

	async updateAvatar(user: User, filename: string): Promise<User> {
		console.log("updateAvatar in service (): " + user.id);
		if (filename) {
			const fs = require('fs');
			const ancient_filename: string = await this.getAvatarUrl(user.id);
			if (ancient_filename === null)
				return null;
			try {
				await getRepository(User)
					.createQueryBuilder("user")
					.update(User)
					.set({
						avatar: filename,
					})
					.where("id = :id", { id: user.id })
					.printSql()
					.execute();
			} catch (error) {
				throw new InternalServerErrorException("Update of avatar does not work");
			}
			if (ancient_filename !== 'default.png') {
				try {
					if (fs.existsSync('src/avatar/' + ancient_filename)) {
						fs.unlinkSync('src/avatar/' + ancient_filename);
					}
				} catch (error) {
					throw new InternalServerErrorException("Deletion of old avatar failed");
				}
			}
		}
		return await this.userRepository.findOne(user.id);
	}

	async updateTwoFAUser(user: User, istwofa: boolean): Promise<User> {
		try {
			await getRepository(User)
				.createQueryBuilder("user")
				.update(User)
				.set({
					twofauser: istwofa,
				})
				.where("id = :id", { id: user.id })
				.printSql()
				.execute();
		} catch (error) {
			throw new InternalServerErrorException("Update TwoFAUser not work");
		}
		return await this.userRepository.findOne(user.id);
	}

	async getAvatarUrl(userid: number): Promise<string> {
		try {
			return (await this.userRepository.findOne(userid)).avatar;
		} catch (error) {
			throw new InternalServerErrorException("Query to search for avatar failed");
		}
	}

	async getAvatar(filename: string): Promise<StreamableFile> {
		var file: ReadStream;
		var path_avatar = 'src/avatar/';
		const fs = require('fs');
		try {

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
		} catch (error) {
			throw new InternalServerErrorException("Creation of StreamableFile(" + filename + ") failed");
		}
	}

	async removeAll(): Promise<User[]> {
		try {
			await this.userRepository.clear();
			return this.getUsers();
		} catch (error) {
			throw new InternalServerErrorException("Deletion of every users failed");
		}
	}

	async findOne(login_user: string): Promise<User> {
		try {
			return this.userRepository.findOne({ where: { login: login_user } });
		} catch (error) {
			throw new InternalServerErrorException("Query to search for user with login: " + login_user + " failed");
		}
	}

	async findOneByEmail(email_user: string): Promise<User> {
		try {
			return this.userRepository.findOne({ where: { email: email_user } });
		} catch (error) {
			throw new InternalServerErrorException("Query to search for user with email: " + email_user + " failed");
		}
	}

	async addChannel(user_id: number, chan_id: number): Promise<void> {
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
