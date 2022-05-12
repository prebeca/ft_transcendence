import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	ParseArrayPipe,
	Headers
} from '@nestjs/common';
import { CreateChannelDto } from '../dto/channels.dto';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService) { }

	@Get()
	getChannels() {
		return this.channelService.getChannels();
	}

	@Get('id?:id')
	findChannelsById(@Param('id') id: string) {
		console.log(id);
		//return this.channelService.findChannelsById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createChannels(@Body() createChannelDto: CreateChannelDto) {
		return this.channelService.createChannel(createChannelDto);
	}

	@Get('delete/:id')
	deleteChannelsById(@Param('id', ParseIntPipe) id: number) {
		return this.channelService.remove(id);
	}

	@Get('deleteall')
	deleteChannels() {
		return this.channelService.removeAll();
	}

	@Post('addGroup')
	addGroup(@Body(new ParseArrayPipe({items: CreateChannelDto}))
		createChannelDtos: CreateChannelDto[],
	) {
		for (const val of createChannelDtos)
			this.channelService.createChannel(val);
		return this.channelService.getChannels();
	}
}
