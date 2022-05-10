import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';
import { Any, Repository } from 'typeorm';
import { CreateChannelDto } from 'src/channels/dto/channel.dto';

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(Channel) private readonly ChannelsRepository: Repository<Channel>,
	) { }

	getChannels(): Promise<Channel[]> {
		return this.ChannelsRepository.find();
	}

	async createChannels(createChannelsDto: CreateChannelDto) {
		let result;
		if (result = await this.ChannelsRepository.findOne({where: {name: createChannelsDto.name}}))
		{
			console.log(result);
			console.log("Error login already exist !");
			return (null)
		}
		const newChannels = this.ChannelsRepository.create(createChannelsDto);
		console.log(newChannels);
		return this.ChannelsRepository.save(newChannels);
	}

	findChannelsById(id: number): Promise<Channel> {
		return this.ChannelsRepository.findOne(id);
	}

	async remove(id: number): Promise<Channel[]> {
		await this.ChannelsRepository.delete(id);
		return this.getChannels(); 
	}

	async removeAll(): Promise<Channel[]> {
		await this.ChannelsRepository.clear();
		return this.getChannels();
	}

	async findOne(Channels_name: string): Promise<Channel> {
		return this.ChannelsRepository.findOne({where: {name: Channels_name}});
	}
}