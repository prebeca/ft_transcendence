import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Message, Channel } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(data: Message, client: Socket) {
		console.log("join room " + data.channel_name)
		await client.join(data.channel_id.toString())							// join socket room
	}

	async leaveChannel(data: Message, client: Socket) {
		console.log("leave room " + data.channel_name)
		await client.leave(data.channel_id.toString())							// leave socket room
	}

	async newMessage(data: Message, client: Socket, server: Server) {
		// if (data.content[0] == '/') {
		// 	// TODO handle cmd
		// 	let answer: Message;
		// 	if (data.content.toLowerCase() == "/clear")
		// 		answer = await this.channelService.clearChat(data.channel_id);
		// 	server.to(answer.channel_id.toString()).emit('NewMessage', answer);
		// }
		// else {
		// 	await this.channelService.addMessageToChannel(data.channel_id, data);
		// 	server.to(data.channel_id.toString()).emit('NewMessage');
		// }
		server.to(data.channel_id.toString()).emit('NewMessage');
	}
}
