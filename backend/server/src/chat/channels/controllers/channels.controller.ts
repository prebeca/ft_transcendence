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
	Req,
	UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/services/users.service';
import { CreateChannelDto } from '../dto/channels.dto';
import { Channel, Message } from '../entities/channel.entity';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService, private readonly usersService: UsersService) { }

	@Get()
	getChannels() {
		return this.channelService.getChannels();
	}

	@Get('messages/:id')
	async getMessages(@Param('id') id: number) {
		return await this.channelService.getMessages(id);
	}

	@Get('ids?:ids')
	getChannelsById(@Param('ids') ids: number[]) {
		return this.channelService.getChannelsById(ids);
	}

	// @Post('create')
	// @UsePipes(ValidationPipe)
	// createChannels(@Body() createChannelDto: CreateChannelDto) {
	// 	return this.channelService.createChannel(createChannelDto);
	// }

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

	// @Post('create')
	// createChannel(@Body(new ParseArrayPipe({ items: CreateChannelDto }))
	// createChannelDto: CreateChannelDto,
	// ) {
	// 	this.channelService.createChannel(createChannelDto);
	// 	return this.channelService.getChannels();
	// }

	@UseGuards(JwtAuthGuard)
	@Post('create')
	async createChannel(@Req() req: Request, @Body() createChannelDto: CreateChannelDto) {
		let channel: Channel = await this.channelService.createChannel(createChannelDto);
		if (channel == null) {
			console.log("ERROR: channels/create: channel = " + channel + " (channel name already in use)");
			return
		}
		console.log("created new channel : " + channel);
		channel.owner = req.user["userid"];
		channel.admin_ids.push(req.user["userid"]);
		this.channelService.addUser(channel.id, req.user["userid"])
		this.usersService.addChannel(req.user["userid"], channel.id);
		return this.channelService.updateChannel(channel);
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
