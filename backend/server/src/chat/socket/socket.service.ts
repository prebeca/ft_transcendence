import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { User } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { CreateMessageDto } from '../channels/dto/messages.dto';
import { Message, MessageData } from '../channels/entities/message.entity';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(user: User, data: MessageData, client: Socket): Promise<boolean> {
		if (this.channelService.joinChannel(user, data) == null) return false;
		client.join(data.target_id.toString())							// join socket room
		return true
	}

	async leaveChannel(user: User, data: MessageData, client: Socket) {
		console.log(user.username + " left room " + data.channel_name)
		await client.leave(data.target_id.toString())							// leave socket room
	}

	async newMessage(user: User, messageDto: CreateMessageDto, client: Socket, server: Server) {
		let message = await this.channelService.handleMessage(user, messageDto)
		server.to(message.target_id.toString()).emit('NewMessage', message);
	}

	async invite(user: User, messageDto: CreateMessageDto, client: Socket) {
		let message = await this.channelService.handleMessage(user, messageDto)
		let target = await this.userService.findUsersById(message.target_id);
		let channel = await this.channelService.findOneByName(message.content)

		if (target == null || channel == null) return

		this.channelService.addInvite(channel.id, messageDto.target_id)
		client.to(target.socket_id).emit('invite', message);
	}

	async setSocket(user: User, client: Socket) {
		this.userService.updateSocket(user, client.id);
	}

	async privateMessage(user: User, messageDto: CreateMessageDto, client: Socket): Promise<Message> {
		let target = await this.userService.findUsersById(messageDto.target_id)
		let message = await this.channelService.createMEssage(user, messageDto);
		client.to(target.socket_id).emit('PrivateMessage', message);
		return message
	}
}
