import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(data: Message, client: Socket, server: Server) {
		await client.join(data.channel_id.toString())							// join socket room
		await this.channelService.addUser(data.channel_id, data.user_id)		// add user to channel members
		await this.userService.addChannel(data.user_id, data.channel_id)		// add channel to the user's channels list
	}

	async handleMsgDistrib(data: Message, client: Socket, server: Server) {
		if (data.type == "cmd") {
			// TODO handle cmd
			let answer: Message;
			if (data.content.toLowerCase() == "/clear")
				answer = await this.channelService.clearChat(data.channel_id);
			server.to(answer.channel_id.toString()).emit('NewMessage', answer);
		}
		else {
			await this.channelService.addMessageToChannel(data.channel_id, data);
			server.to(data.channel_id.toString()).emit('NewMessage');
		}
	}
}
