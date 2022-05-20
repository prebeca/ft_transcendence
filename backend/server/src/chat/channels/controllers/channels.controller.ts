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
	Headers,
} from '@nestjs/common';
import { CreateChannelDto } from '../dto/channels.dto';
import { Message } from '../entities/channel.entity';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService) { }

	@Get()
	getChannels() {
		return this.channelService.getChannels();
	}

	@Get('messages/:id')
	async getMessages(@Param('id') id: number) {
		return await this.channelService.getMessages(id);
	}

	// @Get('id?:id')
	// findChannelsById(@Param('id') id: number) {
	// 	console.log(id);
	// 	return this.channelService.getChannelsById(id);
	// }

	@Get('ids?:ids')
	getChannelsById(@Param('ids') ids: number[]) {
		// console.log(ids[0]);
		return this.channelService.getChannelsById(ids);
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

	// @Post('deleteall')
	// addMessageToChannel(@Param('id', ParseIntPipe) id: number, msg: Message) {
	// 	return this.channelService.addMessageToChannel(id, msg);
	// }

	@Post('create')
	createChannel(@Body(new ParseArrayPipe({ items: CreateChannelDto }))
	createChannelDto: CreateChannelDto,
	) {
		this.channelService.createChannel(createChannelDto);
		return this.channelService.getChannels();
	}

	@Post('addGroup')
	addGroup(@Body(new ParseArrayPipe({ items: CreateChannelDto }))
	createChannelDtos: CreateChannelDto[],
	) {
		for (const val of createChannelDtos)
			this.channelService.createChannel(val);
		return this.channelService.getChannels();
	}
}
