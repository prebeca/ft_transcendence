import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	Req,
	ParseArrayPipe
} from '@nestjs/common';
import { equal } from 'assert';
import { CreateChannelDto} from '../dto/channel.dto';
import { ChannelsService } from 'src/channels/services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly Channelservice: ChannelsService) { }

	@Get()
	getChannels() {
		return this.Channelservice.getChannels();
	}

	@Get('id/:id')
	findChannelsById(@Param('id') id: number) {
		console.log("looking for id = " + id);
		return this.Channelservice.findChannelsById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createChannels(@Body() createChannelsDto: CreateChannelDto) {
		return this.Channelservice.createChannels(createChannelsDto);
	}
	
	@Get('delete/:id')
	deleteChannelsById(@Param('id', ParseIntPipe) id: number) {
		return this.Channelservice.remove(id);
	}

	@Get('deleteall')
	deleteChannels() {
		return this.Channelservice.removeAll();
	}

	@Post('addGroup')
	addGroup(@Body(new ParseArrayPipe({items: CreateChannelDto}))
		createChannelsDtos: CreateChannelDto[],
	) {
		for (const val of createChannelsDtos)
			this.Channelservice.createChannels(val);
		return this.Channelservice.getChannels();
	}
}
