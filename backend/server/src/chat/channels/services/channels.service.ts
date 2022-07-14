import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateChannelDto } from 'src/chat/channels/dto/channels.dto';
import { Message } from '../entities/message.entity';
import { UsersService } from 'src/users/services/users.service';
import { CreateMessageDto } from '../dto/messages.dto';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
		@InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
		private readonly userService: UsersService
	) { }


	async createChannel(user: User, createChannelDto: CreateChannelDto) {
		let channel: Channel = await this.channelRepository.findOne({ where: { name: createChannelDto.name } })

		if (channel != null)
			throw new InternalServerErrorException("Channel already exist");
		if (createChannelDto.scope == 'protected' && createChannelDto.password.length == 0)
			throw new InternalServerErrorException("Empty password for Protected Channel");

		if (createChannelDto.scope != "protected")
			createChannelDto.password = null

		let channeltmp = this.channelRepository.create(createChannelDto);
		await this.channelRepository.save(channeltmp);
		channel = await this.channelRepository.findOne({ where: { name: createChannelDto.name }, relations: ["admins", "users", "invited"] })

		channel.owner = user;
		channel.admins.push(user);
		channel.users.push(user);
		if (channel.scope == "private")
			this.addInvite(channel.id, user.id)
		this.userService.addChannel(user.id, channel);
		return this.channelRepository.save(channel);
	}

	getChannels(): Promise<Channel[]> {
		return this.channelRepository.find();
	}

	async getChannelsById(ids: number[]): Promise<Channel[]> {
		let channels: Channel[] = [];
		for (let i = 0; i < ids.length; ++i) {
			let channel = await this.channelRepository.findOne(ids[i]);
			if (channel != undefined)
				channels.push(channel)
		}
		return channels;
	}

	async getUsers(channel_id: number): Promise<User[]> {
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["users"] });
		let userList = [];
		for (let i = 0; i < channel.users.length; ++i) {
			userList.push(await this.userService.findUsersById(channel.users[i].id));
		}
		return userList;
	}

	async getMessages(user: User, channel_id: number): Promise<Message[]> {
		user = await this.userService.findUsersById(user.id)
		let messages: Message[];
		if (user.channels.find(e => { return e.id == channel_id }))
			messages = await this.messagesRepository.find({ where: { target_id: channel_id } });
		let sendlist: Message[] = []
		for (let i = 0; i < messages.length; ++i) {
			let isblock = user.blocked.find(e => { return e.id == messages[i].user_id })
			if (isblock == undefined)
				sendlist.push(messages[i]);
		}
		return (sendlist);
	}

	async deleteMessage(id: number) {
		let message = await this.messagesRepository.findOne(id);
		if (message)
			this.messagesRepository.remove(message);
	}

	async deleteMessages(channel_id: number) {
		this.messagesRepository.createQueryBuilder().delete().where({ target_id: channel_id }).execute();
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
		return this.channelRepository.findOne(id, { relations: ["users", "admins", "invited"] });
	}

	async addInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id, { relations: ["invited"] });
		let user: User = await this.userService.findUsersById(user_id)

		if (user == null)
			return

		let index: number = channel.invited.findIndex(e => { return e == user });
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
		let index: number = channel.invited.findIndex(e => { return e == user });
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
		let channel = await this.channelRepository.findOne(channel_id, { relations: ["users"] });
		let user: User = await this.userService.findUsersById(user_id)
		if (channel == null || user == null)
			return;
		if (channel.users.find(e => { return e.id == user.id }) === undefined) return

		let index = channel.users.findIndex(e => { return e.id == user.id });
		channel.users.splice(index, 1);

		if (channel.owner == user)
			channel.owner = null;

		console.log("user removed from channel")

		await this.channelRepository.save(channel);
	}

	async joinChannel(user: User, data: CreateMessageDto) {
		const channel: Channel = await this.findOneById(data.target_id);
		const message: Message = await this.createMessage(user, data);

		if (channel.users.find(e => { return e.id == user.id }) != undefined)
			return channel;
		if (channel.scope == "protected" && channel.password != message.content)
			return null;
		if (channel.scope == "private" && channel.invited.find((e) => { return e.id == user.id }) == undefined)
			return null;

		this.addUser(message.target_id, user.id)					// add user to channel members
		this.userService.addChannel(user.id, channel)	// add channel to the user's channels list
		this.removeInvite(message.target_id, user.id);
		return channel;
	}

	async leaveChannel(user: User, data: CreateMessageDto): Promise<Channel> {
		const channel: Channel = await this.findOneById(data.target_id);
		const message: Message = await this.createMessage(user, data);

		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			return null;

		this.removeUser(message.target_id, message.user_id)					// remove user from channel members and remove ownership
		this.userService.removeChannel(message.user_id, channel)	// remove channel to the user's channels list
		this.removeInvite(message.target_id, message.user_id);
		return channel;
	}

	async createMessage(user: User, messageDto: CreateMessageDto): Promise<Message> {
		let message = this.messagesRepository.create(messageDto)
		message.user_name = user.username;
		message.user_id = user.id;
		return message
	}

	async handleMessage(user: User, messageDto: CreateMessageDto): Promise<Message> {
		let channel = await this.findOneById(messageDto.target_id);
		if (channel == null)
			throw new InternalServerErrorException("No such channel");
		if (user == null)
			throw new InternalServerErrorException("Request from unknown user");
		if (channel.users.find(e => { return e.id == user.id }) == undefined)
			throw new InternalServerErrorException("User not in channel");
		let message = await this.createMessage(user, messageDto);
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
}
