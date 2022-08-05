import { HttpException, HttpStatus, Inject, Injectable, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'fs';
import { FriendsService } from 'src/friends/services/friends.service';
import { Player } from 'src/game/entities/player.entity';
import { Channel } from 'src/typeorm';
import { UserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { AvatarStatusGateway } from '../gateways/avatarstatus.gateway';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly friendsService: FriendsService
	) { }

	@Inject()
	private readonly statusGateway: AvatarStatusGateway;

	async getUsers(): Promise<User[]> {
		try {
			return this.userRepository.find({ relations: ["player", "friends"] });
		} catch (error) {
			throw new HttpException("Query to find every users failed", HttpStatus.INTERNAL_SERVER_ERROR);
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
			throw new HttpException("Creation of user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findUsersById(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne({ where: { id: id }, relations: ["friends", "channels", "blocked"] });
			if (!(user as User))
				return null;
			var friends: User[] = user.friends;
			friends.forEach(this.removeDataFromFriends);
			user.friends = friends;
			return user as User;
		} catch (error) {
			throw new HttpException("Query to find user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findUsersByIdWithChannels(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne({ where: { id: id }, relations: ["friends", "blocked", "channels", "channels.messages", "channels.users", "channels.messages.user", "channels.messages.channel", "channels.admins", "channels.owner"] });
			if (!(user as User))
				return null;
			user.channels.forEach(chan => {
				chan.messages = chan.messages.filter(msg => { return (user.blocked.find(blocked_user => { return blocked_user.id == msg.user.id }) == undefined) });
				chan.password = undefined
			})
			var friends: User[] = user.friends;
			friends.forEach(this.removeDataFromFriends);
			user.friends = friends;
			return user as User;
		} catch (error) {
			throw new HttpException("Query to find user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	removeDataFromFriends(friend: User, index: number, array: User[]) {
		friend.email = undefined;
		friend.channels = undefined;
		friend.blocked = undefined;
		friend.socket_id = undefined;
	}

	async findUsersBySocketId(id: string): Promise<User> {
		try {
			return await this.userRepository.findOne({ where: { socket_id: id }, relations: ["friends", "channels", "blocked"] });
		} catch (error) {
			throw new HttpException("Query to find user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findUsersByIdWithRelations(id: number): Promise<User> {
		try {
			const { password, salt, ...user } = await this.userRepository.findOne({ where: { id: id }, relations: ["player", "friends", "channels", "blocked"] });
			if (!(user as User))
				return null;
			var friends: User[] = user.friends;
			friends.forEach(this.removeDataFromFriends);
			user.friends = friends;
			return user as User;
		} catch (error) {
			throw new HttpException("Query to find user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findUserbyIdWithSensibleData(id: number): Promise<User> {
		try {
			const user: User = await
				this.userRepository
					.createQueryBuilder("user")
					.select("user")
					.where("user.id = :id", { id: id })
					.addSelect(["user.twofauser", "user.twofasecret", "user.refresh_token"])
					.getOne();
			return user;
		} catch (error) {
			throw new HttpException("Query to search for user with id: " + id + " failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async updateUsersById(user: User, updatedto: UpdateUserDto) {
		try {
			const same_user: User = { ...user, ...updatedto };
			await this.userRepository.update(same_user.id, { ...updatedto });
		}
		catch (error) {
			throw new HttpException("update of user failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async updateUserinfo(user: User, new_username: string, istwofa?: boolean): Promise<void> {
		if (istwofa !== undefined)
			await this.updateTwoFAUser(user, istwofa);
		await this.updateUsername(user, new_username);
	}

	async updateSecret2FA(user: User, new_secret: string): Promise<void> {
		if (!new_secret)
			throw new UnauthorizedException("Fill in the new secret please");
		try {
			this.updateUsersById(user, { twofasecret: new_secret })
		}
		catch (error) {
			throw new HttpException("Update of 2FA secret did not work", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	containsSpecialChars(str: string) {
		const specialChars: string = `\`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`;

		const result: boolean = specialChars.split('').some(specialChar => {
			if (str.includes(specialChar)) {
				return true;
			}
			return false;
		});
		return result;
	}

	async updateUsername(user: User, new_username: string): Promise<void> {
		if (new_username === user.username)
			return;
		if (!new_username)
			throw new HttpException('Username cannot be empty', HttpStatus.FORBIDDEN);
		if (this.containsSpecialChars(new_username))
			throw new HttpException("Username cannot contain special characters", HttpStatus.CONFLICT);
		const username_user: User = await this.userRepository.findOne({ where: { username: new_username } });
		if (username_user !== undefined)
			throw new HttpException("Username already used", HttpStatus.CONFLICT);
		try {
			this.updateUsersById(user, { username: new_username })
		}
		catch (error) {
			throw new HttpException("Update of username did not work", HttpStatus.INTERNAL_SERVER_ERROR);
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
					throw new HttpException("Deletion of old avatar failed", HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
		}
		this.statusGateway.changingAvatar(user.id, filename);
		return await this.userRepository.findOne({ where: { id: user.id } });
	}

	async cleanLogout(user: User): Promise<void> {
		await this.updateUsersById(user, { refresh_token: null, socket_id: null });
	}

	async updateTwoFAUser(user: User, istwofa: boolean): Promise<User> {
		try {
			await this.updateUsersById(user, { twofauser: istwofa });
			if (!istwofa)
				await this.updateTwoFASecret(user, null);
		} catch (error) {
			throw new HttpException("Update TwoFAUser does not work", HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return await this.userRepository.findOne({ where: { id: user.id } });
	}

	async updateTwoFASecret(user: User, twofasecret: string): Promise<void> {
		try {
			return this.updateUsersById(user, { twofasecret: twofasecret });
		} catch (error) {
			throw new HttpException("Update of twofasecret failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async getAvatarUrl(userid: number): Promise<string> {
		try {
			return (await this.userRepository.findOne({ where: { id: userid } })).avatar;
		} catch (error) {
			throw new HttpException("Query to search for avatar failed", HttpStatus.INTERNAL_SERVER_ERROR);
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
			throw new HttpException("Creation of StreamableFile(" + filename + ") failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async removeAll(): Promise<User[]> {
		try {
			await this.userRepository.clear();
			return this.getUsers();
		} catch (error) {
			throw new HttpException("Deletion of every users failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findOne(login_user: string): Promise<User> {
		try {
			return this.userRepository.findOne({ where: { login: login_user } });
		} catch (error) {
			throw new HttpException("Query to search for user with login: " + login_user + " failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findOneByUsername(username: string): Promise<User> {
		try {
			const user = await
				this.userRepository
					.createQueryBuilder("user")
					.select("user")
					.where("user.username = :username", { username: username })
					.getOne();
			return user;
		} catch (error) {
			throw new HttpException("Query to search for user with username: " + username + " failed", HttpStatus.INTERNAL_SERVER_ERROR);
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
			throw new HttpException("Query to search for user with email: " + email_user + " failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	async addChannel(user_id: number, chan: Channel): Promise<void> {
		let user = await this.userRepository.findOne({ where: { id: user_id }, relations: ["channels"] });
		if (user == null)
			return
		if (user.channels.find((e) => { return e.id == chan.id }) != undefined)
			return
		user.channels.push(chan)
		await this.userRepository.save(user);
	}

	async removeChannel(user_id: number, chan: Channel): Promise<void> {
		let user = await this.userRepository.findOne({ where: { id: user_id }, relations: ["channels"] });
		if (user == null)
			return
		if (user.channels.find((e) => { return e.id == chan.id }) == undefined)
			return
		let index = user.channels.findIndex(e => { return e.id == chan.id });
		user.channels.splice(index, 1);
		await this.userRepository.save(user);
	}

	async updateSocket(user: User, socket_id: string) {
		user.socket_id = socket_id;
		this.userRepository.save(user);
	}

	async addToBlocked(user: User, id: number) {
		user = await this.userRepository.findOne({ where: { id: user.id }, relations: ["blocked", "friends"] });
		let target = await this.userRepository.findOne({ where: { id }, relations: ["blocked", "friends"] });
		if (user.id == id) return
		if (target == null) return
		if (user.blocked.find(e => { return e.id == target.id }) != undefined) return

		await this.friendsService.removeFriend(user, target.id);
		await this.friendsService.removeFriend(target, user.id);

		user.blocked.push(target);
		await this.userRepository.save(user);
	}

	async removeFromBlocked(user: User, id: number) {
		let target = await this.userRepository.findOne({ where: { id } });

		if (target == null) return
		let index = user.blocked.findIndex(e => { return e.id == target.id });
		if (index == -1) return

		user.blocked.splice(index, 1);
		await this.userRepository.save(user);
	}

}
