import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { User } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { MessageData } from '../channels/entities/message.entity';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(user: User, data: MessageData, client: Socket) {
		console.log(user.username + " joined room " + data.channel_name)
		console.log("data : ", data)
		await client.join(data.channel_id.toString())							// join socket room
	}

	async leaveChannel(user: User, data: MessageData, client: Socket) {
		console.log(user.username + " left room " + data.channel_name)
		await client.leave(data.channel_id.toString())							// leave socket room
	}

	async newMessage(user: User, data: MessageData, client: Socket, server: Server) {
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
