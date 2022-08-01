import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/typeorm';
import { CreateChannelDto } from '../dto/channels.dto';
import { Channel } from '../entities/channel.entity';
import { Message } from '../entities/message.entity';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService) { }

	@UseGuards(JwtAuthGuard)
	@Post('join')
	async joinChannel(@Req() req: Request, @Body() data: Message): Promise<Channel | String> {
		return this.channelService.joinChannel(req.user as User, data);
	}

	@UseGuards(JwtAuthGuard)
	@Post('create')
	async createChannel(@Req() req: Request, @Body() createChannelDto: CreateChannelDto): Promise<Channel | String> {
		console.log("channels/create")
		return this.channelService.createChannel(req.user as User, createChannelDto)
	}

	@UseGuards(JwtAuthGuard)
	@Post('delete/:id')
	async deleteChannel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
		this.channelService.remove(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id/users')
	async getUsers(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User[]> {
		return this.channelService.getUsers(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id/admins')
	async getAdmins(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User[]> {
		return this.channelService.getAdmins(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id/owner')
	async getOwner(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User> {
		return this.channelService.getOwner(id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('handleMessage')
	async handleMessage(@Req() req: Request, @Body() message: Message) {
		this.channelService.handleMessage(req.user as User, message);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/update/password')
	async updatePassword(@Req() req: Request, @Body() data: any): Promise<any> {
		return this.channelService.updatePassword(req.user as User, data);
	}

	@Get()
	getChannels() {
		return this.channelService.getChannels();
	}
}
