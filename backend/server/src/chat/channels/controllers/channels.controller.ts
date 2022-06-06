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
	InternalServerErrorException,
} from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/services/users.service';
import { CreateChannelDto } from '../dto/channels.dto';
import { CreateMessageDto } from '../dto/messages.dto';
import { Channel } from '../entities/channel.entity';
import { MessageData } from '../entities/message.entity';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

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

	@Get('delete/:id')
	deleteChannelsById(@Param('id', ParseIntPipe) id: number) {
		return this.channelService.remove(id);
	}

	@Get('deleteall')
	deleteChannels() {
		return this.channelService.removeAll();
	}

	@UseGuards(JwtAuthGuard)
	@Post('join')
	async joinChannel(@Req() req: Request, @Body() data: MessageData): Promise<Channel> {
		if (req.user["id"] != data.user_id)
			throw new InternalServerErrorException("User id does not match");
		return this.channelService.joinChannel(data);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	async createChannel(@Req() req: Request, @Body() createChannelDto: CreateChannelDto) {
		let channel: Channel = await this.channelService.createChannel(createChannelDto,);

		if (channel == null) {
			if ((channel = await this.channelService.findOneByName(createChannelDto.name)) != null)
				return await this.channelService.joinChannel({
					user_id: req.user["id"],
					channel_id: channel.id,
					content: "",
				} as MessageData);
			else
				return ("ERROR: channels/create: channel = " + createChannelDto.name)
		}
		let owner = req.user["id"];
		channel.owner = owner;
		channel.admin_ids.push(owner);
		channel.users_ids.push(owner);
		await this.userService.addChannel(owner, channel.id);
		return await this.channelService.updateChannel(channel);
	}

	@UseGuards(JwtAuthGuard)
	@Post('delete/:id')
	async deleteChannel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
		return await this.channelService.remove(id);
	}

	// @Post('addGroup')
	// addGroup(@Body(new ParseArrayPipe({ items: CreateChannelDto }))
	// createChannelDtos: CreateChannelDto[],
	// ) {
	// 	for (const val of createChannelDtos)
	// 		this.channelService.createChannel(val);
	// 	return this.channelService.getChannels();
	// }

	@UseGuards(JwtAuthGuard)
	@Post('handleMessage')
	async handleMessage(@Req() req: Request, @Body() messageDto: CreateMessageDto) {
		let channel = await this.channelService.findOneById(messageDto.channel_id);
		let user = await this.userService.findUsersById(req.user["id"]);
		if (channel == null)
			throw new InternalServerErrorException("No such channel");
		if (user == null)
			throw new InternalServerErrorException("Request from unknown user");
		if (channel.users_ids.find(e => e == user.id) == undefined)
			throw new InternalServerErrorException("User not in channel");
		await this.channelService.handleMessage(channel, user, messageDto);
	}
}
