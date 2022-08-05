import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { JwtTwoFactorAuthGuard } from '../../../auth/guards/jwt-twofa.guard';
import { User } from '../../../typeorm';
import { CreateChannelDto } from '../dto/channels.dto';
import { Channel } from '../entities/channel.entity';
import { Message } from '../entities/message.entity';
import { ChannelsService } from '../services/channels.service';

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelsService) { }

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('join')
	async joinChannel(@Req() req: Request, @Body() data: any): Promise<Channel | String> {
		return this.channelService.joinChannel(req.user as User, data);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('create')
	async createChannel(@Req() req: Request, @Body() createChannelDto: CreateChannelDto): Promise<Channel | String> {
		return this.channelService.createChannel(req.user as User, createChannelDto)
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('delete/:id')
	async deleteChannel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
		this.channelService.remove(id);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get(':id/users')
	async getUsers(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User[]> {
		return this.channelService.getUsers(id);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get(':id/admins')
	async getAdmins(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User[]> {
		return this.channelService.getAdmins(id);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get(':id/owner')
	async getOwner(@Req() req: Request, @Param('id', ParseIntPipe) id: number): Promise<User> {
		return this.channelService.getOwner(id);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('handleMessage')
	async handleMessage(@Req() req: Request, @Body() message: Message) {
		this.channelService.handleMessage(req.user as User, message);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post(':id/update/password')
	async updatePassword(@Req() req: Request, @Body() data: any): Promise<any> {
		return this.channelService.updatePassword(req.user as User, data);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get()
	getChannels(@Req() req: Request) {
		return this.channelService.getChannels();
	}
}
