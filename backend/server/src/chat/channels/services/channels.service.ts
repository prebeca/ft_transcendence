import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateChannelDto } from 'src/chat/channels/dto/channels.dto';
import { Message } from '../entities/channel.entity';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
	) { }

	getChannels(): Promise<Channel[]> {
		return this.channelRepository.find();
	}

	async createChannel(createChannelDto: CreateChannelDto) {
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

	async addMessageToChannel(id: number, msg: Message): Promise<Channel> {
		var chan = await this.channelRepository.findOne({ where: { id: id } })
		chan.messages.push(msg);
		return chan;
	}
}
