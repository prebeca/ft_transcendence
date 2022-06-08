import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, User } from 'src/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateChannelDto } from 'src/chat/channels/dto/channels.dto';
import { Message, MessageData } from '../entities/message.entity';
import { channel } from 'diagnostics_channel';
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
		let channel = await this.channelRepository.findOne({ where: { name: createChannelDto.name } })

		if (channel != null)
			throw new InternalServerErrorException("Channel already exist");
		if (createChannelDto.scope == 'protected' && createChannelDto.password.length == 0)
			throw new InternalServerErrorException("Empty password for Protected Channel");


		channel = this.channelRepository.create(createChannelDto);
		channel = await this.channelRepository.save(channel)

		if (channel.scope != 'protected')
			channel.password = null

		channel.owner = user.id;
		channel.admin_ids.push(user.id);
		if (channel.scope == "private")
			this.addInvite(channel.id, user.id)
		this.userService.addChannel(user.id, channel.id);
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

	async getUsers(channel_id: number): Promise<string[]> {
		const channel = await this.channelRepository.findOne(channel_id);
		let userList = [];
		for (let i = 0; i < channel.users_ids.length; ++i) {
			userList.push((await this.userService.findUsersById(channel.users_ids[i])).login);
		}
		return userList;
	}

	async getMessages(channel_id: number): Promise<Message[]> {
		return (this.messagesRepository.find({ where: { target_id: channel_id } }));
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
		for (let i = 0; i < channel.users_ids.length; ++i) {
			let user = await this.userService.findUsersById(channel.users_ids[i])
			if (user == null) continue
			let index = user.channels.findIndex(e => e == channel.id)
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
		return this.channelRepository.findOne(id);
	}

	async addInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id);
		let index: number = channel.invited_ids.findIndex(e => { return e == user_id });
		if (index != -1)
			return
		channel.invited_ids.push(user_id);
		this.channelRepository.save(channel);
	}

	async removeInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id);
		let index: number = channel.invited_ids.findIndex(e => { return e == user_id });
		if (index == -1)
			return
		channel.invited_ids.splice(index, 1);
		this.channelRepository.save(channel);
	}

	async addUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id);

		if (channel == null)
			return;
		if (channel.users_ids.find(e => { return e == user_id }) != undefined) return

		channel.users_ids.push(user_id);
		await this.channelRepository.save(channel);
	}

	async removeUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id);
		if (channel == null)
			return;
		if (channel.users_ids.find(e => { return e == user_id }) === undefined) return

		let index = channel.users_ids.findIndex(e => { return e == user_id });
		channel.users_ids.splice(index, 1);

		if (channel.owner == user_id)
			channel.owner = null;

		await this.channelRepository.save(channel);
	}

	async joinChannel(user: User, data: CreateMessageDto): Promise<Channel> {
		const channel: Channel = await this.findOneById(data.target_id);
		const message: Message = await this.createMessage(user, data);

		if (channel.users_ids.find(e => { return e == message.user_id }) != undefined)
			return channel;
		if (channel.scope == "protected" && channel.password != message.content)
			return null;
		if (channel.scope == "private" && channel.invited_ids.find((e: number) => { return e == message.user_id }) == undefined)
			return null;

		this.addUser(message.target_id, user.id)					// add user to channel members
		this.userService.addChannel(user.id, message.target_id)	// add channel to the user's channels list
		this.removeInvite(message.target_id, user.id);
		return channel;
	}

	async leaveChannel(user: User, data: CreateMessageDto): Promise<Channel> {
		const channel: Channel = await this.findOneById(data.target_id);
		const message: Message = await this.createMessage(user, data);

		if (channel.users_ids.find(e => e == message.user_id) == undefined)
			return null;

		this.removeUser(message.target_id, message.user_id)					// remove user from channel members and remove ownership
		this.userService.removeChannel(message.user_id, message.target_id)	// remove channel to the user's channels list
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
		if (channel.users_ids.find(e => e == user.id) == undefined)
			throw new InternalServerErrorException("User not in channel");
		let message = await this.createMessage(user, messageDto);
		return this.messagesRepository.save(message);
	}

	async checkBlock(user: User, message: Message): Promise<Message> {
		if (user.blocked.find(e => e == message.user_id))
			return (null);
		return (message);
	}
}
