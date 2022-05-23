import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateChannelDto } from 'src/chat/channels/dto/channels.dto';
import { Message } from '../entities/channel.entity';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
	) { }

	getChannels(): Promise<Channel[]> {
		return this.channelRepository.find();
	}

	async getMessages(id: number) {
		return (await this.channelRepository.findOne(id)).messages;
	}

	async createChannel(createChannelDto: CreateChannelDto) {
		if (await this.channelRepository.findOne({ where: { name: createChannelDto.name } }) != null)
			return null;
		let newChannel = this.channelRepository.create(createChannelDto);
		console.log("create channel " + newChannel.name)
		return this.channelRepository.save(newChannel);
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

	getChannelsByName(name: string): Promise<Channel> {
		return this.channelRepository.findOne({ where: { name: name } });
	}

	async remove(id: number): Promise<Channel[]> {
		await this.channelRepository.delete(id);
		return this.getChannels();
	}

	async removeAll(): Promise<Channel[]> {
		await this.channelRepository.clear();
		return this.getChannels();
	}

	async findOne(channel_name: string): Promise<Channel> {
		return this.channelRepository.findOne({ where: { name: channel_name } });
	}

	async addUser(channel_id: number, user_id: number) {
		let channel = await this.channelRepository.findOne(channel_id);
		if (channel == null)
			return;
		if (channel.users_ids.find(e => e == user_id) === undefined)
			channel.users_ids.push(user_id);
		await this.channelRepository.save(channel);
	}

	async addMessageToChannel(id: number, msg: Message) {
		let channel = await this.channelRepository.findOne(id);
		try {
			channel.messages.push(msg);
			await this.channelRepository.save(channel);
		} catch (error) {
			console.log(error);
		}
	}

	async clearChat(id: number): Promise<Message> {
		let channel = await this.channelRepository.findOne(id);
		let nb_msg = channel.messages.length;
		channel.messages = [];
		await this.channelRepository.save(channel);
		return ({
			type: "info",
			user_id: 0,
			username: "Clear",
			channel_id: id,
			channel_name: channel.name,
			content: nb_msg + " messages cleared !",
		})
	}

}
