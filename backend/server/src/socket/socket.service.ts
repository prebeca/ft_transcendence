import { Injectable } from '@nestjs/common';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	joinChannel(channel_id: number, user_id: number) {
		this.channelService.addUser(channel_id, user_id) // add user to channel members
		this.userService.addChannel(user_id, channel_id) // add channel to user channels
	}
}
