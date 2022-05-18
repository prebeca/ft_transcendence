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

	async createChannel(createChannelDto: CreateChannelDto) {
		if (await this.channelRepository.findOne({ where: { name: createChannelDto.name } }) != null)
			return;
		const newChannel = this.channelRepository.create(createChannelDto);
		console.log(newChannel);
		return this.channelRepository.save(newChannel);
	}

	getChannelsById(id: number): Promise<Channel> {
		return this.channelRepository.findOne(id);
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
		if (channel.users_ids.find(e => e == user_id) == undefined)
			channel.users_ids.push(user_id);
		this.channelRepository.save(channel);
	}

	// async addMessageToChannel(id: number, msg: Message) {
	// 	await this.channelRepository.update({ where: { id: id } }, )
	// }
}
