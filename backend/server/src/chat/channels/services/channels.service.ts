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

	getChannels(): Promise<Channel[]> {
		return this.channelRepository.find();
	}

	async getMessages(channel_id: number): Promise<Message[]> {
		return (this.messagesRepository.find({ where: { channel_id: channel_id } }));
	}

	async deleteMessage(id: number) {
		let message = await this.messagesRepository.findOne(id);
		if (message)
			this.messagesRepository.remove(message);
	}

	async deleteMessages(channel_id: number) {
		this.messagesRepository.createQueryBuilder().delete().where({ channel_id: channel_id }).execute();
	}

	async createChannel(createChannelDto: CreateChannelDto) {
		if (await this.channelRepository.findOne({ where: { name: createChannelDto.name } }) != null)
			return null;
		let channel = this.channelRepository.create(createChannelDto);
		return await this.channelRepository.save(channel);
	}

	async updateChannel(channel: Channel) {
		if (await this.channelRepository.findOne(channel.id) == null)
			return null;
		console.log("update channel " + channel.name)
		return this.channelRepository.save(channel);
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

	async remove(id: number): Promise<Channel[]> {
		await this.channelRepository.delete(id);
		return this.getChannels();
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
		let index: number = channel.invited_ids.findIndex(e => e == user_id);
		if (index != -1)
			return
		channel.invited_ids.push(user_id);
		this.channelRepository.save(channel);
	}

	async removeInvite(channel_id: number, user_id: number) {
		let channel: Channel = await this.channelRepository.findOne(channel_id);
		let index: number = channel.invited_ids.findIndex(e => e == user_id);
		if (index == -1)
			return
		channel.invited_ids.splice(index, 1);
		this.channelRepository.save(channel);
	}

	async addUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id);
		if (channel == null)
			return;
		if (channel.users_ids.find(e => e == user_id) === undefined)
			channel.users_ids.push(user_id);
		await this.channelRepository.save(channel);
	}

	// async addMessageToChannel(id: number, msg: MessageData) {
	// 	let channel = await this.channelRepository.findOne(id);
	// 	try {
	// 		channel.messages.push(msg);
	// 		await this.channelRepository.save(channel);
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// }

	// async clearChat(id: number): Promise<MessageData> {
	// 	let channel = await this.channelRepository.findOne(id);
	// 	let nb_msg = channel.messages.length;
	// 	channel.messages = [];
	// 	await this.channelRepository.save(channel);
	// 	return ({
	// 		type: "info",
	// 		user_id: 0,
	// 		username: "Clear",
	// 		channel_id: id,
	// 		channel_name: channel.name,
	// 		content: nb_msg + " messages cleared !",
	// 	})
	// }

	async joinChannel(data: MessageData): Promise<Channel> {
		const channel: Channel = await this.findOneById(data.channel_id);

		if (channel.users_ids.find(e => e == data.user_id) != undefined) {
			throw new InternalServerErrorException("Error: already in channel");
		}
		if (channel.scope == "protected" && channel.password != data.content) {
			throw new InternalServerErrorException("Error: bad password");
		}
		if (channel.scope == "private" && channel.invited_ids.find((e: number) => e == data.user_id) == undefined) {
			throw new InternalServerErrorException("Error: not invited");
		}

		await this.addUser(data.channel_id, data.user_id)					// add user to channel members
		await this.userService.addChannel(data.user_id, data.channel_id)	// add channel to the user's channels list
		await this.removeInvite(data.channel_id, data.user_id);
		return channel;
	}

	async handleMessage(channel: Channel, user: User, messageDto: CreateMessageDto) {
		if (messageDto.content[0] == '/')
			console.log("handle commands")
		else {
			let message = this.messagesRepository.create(messageDto)
			message.user_name = user.username;
			message.user_id = user.id;
			await this.messagesRepository.save(message);
		}
	}
}
