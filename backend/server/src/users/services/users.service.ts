import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import { createReadStream } from 'fs';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { Player } from 'src/game/entities/player.entity';
import { AvatarStatusGateway } from '../gateways/avatarstatus.gateway';
import { Socket } from 'socket.io';
import { Channel } from 'src/typeorm';
import { ConnectableObservable } from 'rxjs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }

	@Inject()
	private readonly statusGateway: AvatarStatusGateway;

	async getUsers(): Promise<User[]> {
		try {
			return this.userRepository.find({ relations: ["player", "friends"] });
		} catch (error) {
			throw new InternalServerErrorException("Query to find every users failed");
		}
	}

	async createUser(userDto: UserDto): Promise<User> {
		try {
			const player = new Player();
			const newuser: User = this.userRepository.create(userDto);
			newuser.player = player;
			newuser.channels = []
			return this.userRepository.save(newuser);
		} catch (error) {
			throw new InternalServerErrorException("Creation of user failed");
		}
	}

	async findUsersById(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne(id, { relations: ["friends", "channels", "blocked"] });
			if (!(user as User))
				return null;
			return user as User;
		} catch (error) {
			throw new InternalServerErrorException("Query to find user failed");
		}
	}

	removeDataFromFriends(friend: User, index: number, array: User[]) {
		friend.email = undefined;
		friend.channels = undefined;
		friend.blocked = undefined;
		friend.socket_id = undefined;
	}

	async findUsersBySocketId(id: string): Promise<User> {
		console.log(id)
		try {
			return await this.userRepository.findOne({ where: { socket_id: id }, relations: ["friends", "channels", "blocked"] });
		} catch (error) {
			throw new InternalServerErrorException("Query to find user failed");
		}
	}

	async findUsersByIdWithRelations(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne(id, { relations: ["player", "friends", "channels"] });
			if (!(user as User))
				return null;
			var friends: User[] = user.friends;
			friends.forEach(this.removeDataFromFriends);
			user.friends = friends;
			return user as User;
		} catch (error) {
			throw new InternalServerErrorException("Query to find user failed");
		}
	}

	async findUserbyIdWithSensibleData(id: number): Promise<User> {
		try {
			const user: User = await
				this.userRepository
					.createQueryBuilder("user")
					.select("user")
					.where("user.id = :id", { id: id })
					.addSelect(["user.twofauser", "user.twofasecret"])
					.getOne();
			return user;
		} catch (error) {
			throw new InternalServerErrorException("Query to search for user with id: " + id + " failed");
		}
	}

	async updateUsersById(user: User, updatedto: UpdateUserDto): Promise<User> {
		try {
			const same_user: User = { ...user, ...updatedto };
			return await this.userRepository.save(same_user);
		}
		catch (error) {
			throw new InternalServerErrorException("update of user failed");
		}
	}

	async updateUserinfo(user: User, new_username: string, istwofa?: boolean): Promise<void> {
		if (istwofa === undefined)
			this.updateTwoFAUser(user, istwofa);
		return this.updateUsername(user, new_username);
	}

	async updateSecret2FA(user: User, new_secret: string): Promise<void> {
		if (!new_secret)
			throw new UnauthorizedException("Fill in the new secret please");
		try {
			this.updateUsersById(user, { twofasecret: new_secret })
		}
		catch (error) {
			throw new InternalServerErrorException("Update of 2FA secret did not work");
		}
	}
	async updateUsername(user: User, new_username: string): Promise<void> {
		if (!new_username)
			throw new HttpException('Username cannot be empty', HttpStatus.FORBIDDEN);
		try {
			this.updateUsersById(user, { username: new_username })
		}
		catch (error) {
			throw new InternalServerErrorException("Update of username did not work");
		}
	}

	async updateAvatar(user: User, filename: string): Promise<User> {
		if (filename) {
			const fs = require('fs');
			const ancient_filename: string = await this.getAvatarUrl(user.id);
			if (ancient_filename === null)
				return null;
			try {
				await this.updateUsersById(user, { avatar: filename });
			} catch (error) {
				throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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
		this.statusGateway.changingAvatar(user.id, filename);
		return await this.userRepository.findOne(user.id);
	}

	async updateTwoFAUser(user: User, istwofa: boolean): Promise<User> {
		try {
			await this.updateUsersById(user, { twofauser: istwofa });
		} catch (error) {
			throw new InternalServerErrorException("Update TwoFAUser not work");
		}
		return await this.userRepository.findOne(user.id);
	}

	async updateTwoFASecret(user: User, twofasecret: string): Promise<User> {
		try {
			return this.updateUsersById(user, { twofasecret: twofasecret });
		} catch (error) {
			throw new InternalServerErrorException("Update of twofasecret failed");
		}
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
			const user = await
				this.userRepository
					.createQueryBuilder("user")
					.select("user")
					.where("user.email = :email", { email: email_user })
					.addSelect(["user.password", "user.twofauser", "user.twofasecret"])
					.getOne();
			return user;
		} catch (error) {
			throw new InternalServerErrorException("Query to search for user with email: " + email_user + " failed");
		}
	}

	async addChannel(user_id: number, chan: Channel): Promise<void> {
		let user = await this.userRepository.findOne(user_id, { relations: ["channels"] });
		if (user == null)
			return
		if (user.channels.find((e) => { return e.id == chan.id }) != undefined)
			return
		user.channels.push(chan)
		this.userRepository.save(user);
	}

	async removeChannel(user_id: number, chan: Channel): Promise<void> {
		let user = await this.userRepository.findOne(user_id, { relations: ["channels"] });
		console.log("channel removed from user 0")
		if (user == null)
			return
		console.log("channel removed from user A")
		if (user.channels.find((e) => { return e.id == chan.id }) == undefined)
			return
		let index = user.channels.findIndex(e => { return e.id == chan.id });
		user.channels.splice(index, 1);
		this.userRepository.save(user);
		console.log("channel removed from user B")
	}

	async updateSocket(user: User, socket_id: string) {
		user.socket_id = socket_id;
		this.userRepository.save(user);
	}

	async addToBlocked(user: User, id: number) {
		user = await this.userRepository.findOne(user.id, { relations: ["blocked"] });
		if (user.id == id) return
		let target = await this.userRepository.findOne(id);
		if (target == null) return // wrong id
		if (user.blocked.find(e => { return e == target }) != undefined) return // already blocked

		user.blocked.push(target);
		this.userRepository.save(user);
	}

	async removeFromBlocked(user: User, id: number) {
		let target = await this.userRepository.findOne(id);

		if (target == null) return // wrong id
		if (user.blocked.find(e => e == target) == undefined) return // not blocked

		let index = user.blocked.findIndex(e => { return e == target });
		user.blocked.splice(index, 1);
		this.userRepository.save(user);
	}
}
