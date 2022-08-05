import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, User, Ban, Mute } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from 'src/chat/channels/dto/channels.dto';
import { Message } from '../entities/message.entity';
import { UsersService } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
		@InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
		@InjectRepository(Ban) private readonly BanRepository: Repository<Ban>,
		@InjectRepository(Mute) private readonly MuteRepository: Repository<Mute>,
		private readonly userService: UsersService
	) { }


	async createChannel(user: User, createChannelDto: CreateChannelDto): Promise<Channel | string> {
		console.log(user.username)
		let channel: Channel = await this.channelRepository.findOne({ where: { name: createChannelDto.name } })

		if (createChannelDto.scope != "dm" && createChannelDto.name.startsWith("dm_"))
			return "Name contain unauthorized pattern";
		if (channel != null)
			return "Channel already exist";
		if (createChannelDto.scope == 'protected' && createChannelDto.password.length == 0)
			return "Empty password for Protected Channel";

		if (createChannelDto.scope != "protected")
			createChannelDto.password = null
		else {
			const salt = await bcrypt.genSalt();
			createChannelDto.password = await bcrypt.hash(createChannelDto.password, salt);
		}

		let channeltmp = this.channelRepository.create(createChannelDto);
		channel = await this.channelRepository.save(channeltmp);
		channel = await this.channelRepository.findOne(channel.id, { relations: ["admins", "users"] })

		if (channel.scope != "dm") {
			channel.owner = user;
			channel.admins.push(user);
		}
		channel.users.push(user);
		if (channel.scope == "private")
			this.addInvite(channel.id, user.id)
		await this.userService.addChannel(user.id, channel);
		channel = await this.channelRepository.save(channel)
		channel.password = undefined;
		return channel;
	}

	deleteChannel(channel_id: number) {
		this.channelRepository.delete(channel_id);
	}

	async getChannels(): Promise<Channel[]> {
		let channels = await this.channelRepository.find();
		channels.forEach(e => { e.password = undefined });
		return channels;
	}

	async getChannel(user: User, id: number): Promise<Channel | String> {
		let channel = await this.channelRepository.findOne(id, { relations: ["admins", "users", "messages", "messages.user", "messages.channel"] });

		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			return;

		channel.password = undefined;

		return channel
	}

	async getUsers(channel_id: number): Promise<User[]> {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["users"] });
		let userList = [];
		for (let i = 0; i < channel.users.length; ++i) {
			userList.push(await this.userService.findUsersById(channel.users[i].id));
		}
		return userList;
	}

	async getAdmins(channel_id: number): Promise<User[]> {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["admins"] });
		let adminList = [];
		for (let i = 0; i < channel.admins.length; ++i) {
			adminList.push(await this.userService.findUsersById(channel.admins[i].id));
		}
		adminList.forEach(e => { e.password = undefined; e.socket_id = undefined })
		return adminList;
	}

	async getOwner(channel_id: number): Promise<User> {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["owner"] });
		return await this.userService.findUsersById(channel.owner.id)
	}

	async deleteMessage(id: number) {
		let message = await this.messagesRepository.findOne(id);
		if (message)
			this.messagesRepository.remove(message);
	}

	async updateChannel(channel: Channel) {
		if (await this.channelRepository.findOne(channel.id) == null)
			return null;
		return this.channelRepository.save(channel);
	}

	async remove(id: number) {
		let channel = await this.findOneById(id)
		if (channel == null) return;
		for (let i = 0; i < channel.users.length; ++i) {
			let user = await this.userService.findUsersById(channel.users[i].id)
			if (user == null) continue
			let index = user.channels.findIndex(e => e.id == channel.id)
			user.channels.splice(index, 1);
		}
		this.channelRepository.delete(id);
	}

	async removeAll(): Promise<Channel[]> {
		await this.channelRepository.clear();
		return this.getChannels();
	}

	async findOneByName(channel_name: string): Promise<Channel> {
		return this.channelRepository.findOne({ where: { name: channel_name } });
	}

	async findOneById(id: number): Promise<Channel> {
		return this.channelRepository.findOne(id, { relations: ["users", "owner", "admins", "invited", "banned", "banned.user", "muted", "muted.user", "messages", "messages.user", "messages.channel"] });
	}

	async addInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id, { relations: ["invited"] });
		let user: User = await this.userService.findUsersById(user_id)

		if (user == null)
			return

		let index: number = channel.invited.findIndex(e => { return e.id == user.id });
		if (index != -1)
			return

		channel.invited.push(user);
		this.channelRepository.save(channel);
	}

	async removeInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id, { relations: ["invited"] });
		let user: User = await this.userService.findUsersById(user_id)

		if (user == null)
			return
		let index: number = channel.invited.findIndex(e => { return e.id == user.id });
		if (index == -1)
			return
		channel.invited.splice(index, 1);
		this.channelRepository.save(channel);
	}

	async addUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["users"] });
		let user: User = await this.userService.findUsersById(user_id)

		if (channel == null || user == null)
			return;
		if (channel.users.find(e => { return e == user }) != undefined) return

		channel.users.push(user);
		await this.channelRepository.save(channel);
	}

	async removeUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["users", "owner", "admins"] });
		let user: User = await this.userService.findUsersById(user_id)
		if (channel == null || user == null)
			return;
		if (channel.users.find(e => { return e.id == user.id }) == undefined) return

		let index: number;
		if ((index = channel.users.findIndex(e => { return e.id == user.id })) != -1)
			channel.users.splice(index, 1);
		if ((index = channel.admins.findIndex(e => { return e.id == user.id })) != -1)
			channel.admins.splice(index, 1);

		if (channel.owner && channel.owner.id == user.id)
			channel.owner = null;

		await this.channelRepository.save(channel);
	}

	async joinChannel(user: User, data: any) {
		let channel: Channel;
		try {
			channel = await this.findOneById(data.channel_id);
		} catch (error) {
			return "Bad channel id"
		}

		if (channel == null)
			return "Channel does not exist";
		if (channel.users.find(e => { return e.id == user.id }) != undefined)
			return channel;
		if (channel.scope == "protected" && channel.password != null && await bcrypt.compare(data.password, channel.password) == false)
			return "Wrong Password";
		if (channel.scope == "private" && channel.invited.find((e) => { return e.id == user.id }) == undefined)
			return "Not Invited";
		let i = channel.banned.findIndex(e => { return e.user.id == user.id });
		if (i != -1) {
			if (channel.banned[i].end > new Date())
				return "You are still banned for " + ((channel.banned[i].end.valueOf() - (new Date()).valueOf()) / (60 * 1000)).toFixed() + " minutes";
			else
				this.BanRepository.delete(channel.banned[i].id);
		}

		await this.addUser(channel.id, user.id)		// add user to channel members
		await this.userService.addChannel(user.id, channel)	// add channel to the user's channels list
		await this.removeInvite(channel.id, user.id);
		return channel;
	}

	async leaveChannel(user: User, data: any) {
		let channel: Channel;
		try {
			channel = await this.findOneById(data.channel_id);
		} catch (error) {
			return "Bad channel id"
		}

		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			return null;

		this.removeUser(data.channel_id, user.id)			// remove user from channel members and remove privilege
		this.userService.removeChannel(user.id, channel)	// remove channel from the user's channels list
		this.removeInvite(data.channel_id, user.id);
	}

	async handleMessage(user: User, message: Message): Promise<Message> {
		message.user = user;
		let channel = await this.findOneById(message.channel.id);
		if (channel == null)
			throw new InternalServerErrorException("No such channel");
		if (user == null)
			throw new InternalServerErrorException("Request from unknown user");
		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			throw new InternalServerErrorException("User not in channel");
		message.channel = channel;
		return this.messagesRepository.save(message);
	}

	async addAdmin(channel_id: number, user_id: number): Promise<User> {
		let channel: Channel = await this.channelRepository.findOne(channel_id, { relations: ["admins", "users"] });
		let user: User = await this.userService.findUsersById(user_id)

		if (user == null)
			return null;
		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			return null; // user not in channel
		if (channel.admins.find(e => { return e.id == user.id }) != undefined)
			return null; // already admin
		channel.admins.push(user);
		this.channelRepository.save(channel);
		return user;
	}

	async addToBanList(data: any): Promise<User> {
		let channel: Channel = await this.channelRepository.findOne(data.channel_id, { relations: ["banned", "banned.user"] });
		let user: User = await this.userService.findUsersById(data.user_id)

		if (user == null)
			return null;

		let index = channel.banned.findIndex(e => { return e.user.id == user.id })

		if (index != -1) {
			let item = channel.banned.splice(index, 1);
			this.removeFromBanList(item[0])
		}

		let end = new Date();

		end.setMinutes(end.getMinutes() + data.duration)

		let ban = this.BanRepository.create({
			channel: channel,
			user: user,
			end: end,
			duration: data.duration
		})

		this.BanRepository.save(ban);
		channel.banned.push(ban);
		this.channelRepository.save(channel);
		return user;
	}

	async addToMuteList(data: any): Promise<User> {
		let channel: Channel = await this.channelRepository.findOne(data.channel_id, { relations: ["muted", "muted.user"] });
		let user: User = await this.userService.findUsersById(data.user_id)

		if (user == null)
			return null;

		let index = channel.muted.findIndex(e => { return e.user.id == user.id })

		if (index != -1) {
			let item = channel.muted.splice(index, 1);
			this.removeFromMuteList(item[0])
		}

		let end = new Date();

		end.setMinutes(end.getMinutes() + data.duration)

		let ban = this.MuteRepository.create({
			channel: channel,
			user: user,
			end: end,
			duration: data.duration
		})

		this.MuteRepository.save(ban);
		channel.muted.push(ban);
		this.channelRepository.save(channel);
		return user;
	}

	async removeFromMuteList(mute: Mute) {
		this.MuteRepository.delete(mute.id);
	}

	async removeFromBanList(ban: Ban) {
		this.BanRepository.delete(ban.id);
	}

	async updatePassword(user: User, data: any): Promise<any> {
		let channel: Channel = await this.channelRepository.findOne(data.channel_id, { relations: ["admins", "owner"] });

		if (channel.owner == null || channel.owner.id != user.id)
			return { color: "red", content: "ERROR: owner right required" }

		if (channel.password != null && await bcrypt.compare(data.password_old, channel.password) == false)
			return { color: "red", content: "ERROR: wrong password" }

		if (data.password_new == undefined || data.password_new == '')
			channel.password = null;
		else {
			const salt = await bcrypt.genSalt();
			channel.password = await bcrypt.hash(data.password_new, salt);
		}
		await this.channelRepository.save(channel);
		return { color: "green", content: "Password updated succesfully" }
	}
}
