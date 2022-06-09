import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { User, Channel } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { UsingJoinColumnIsNotAllowedError } from 'typeorm';
import { CreateMessageDto } from '../channels/dto/messages.dto';
import { Message, MessageData } from '../channels/entities/message.entity';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(user: User, data: CreateMessageDto, client: Socket): Promise<Channel> {
		let channel = await this.channelService.findOneById(data.target_id);
		if (channel != null) {
			client.join(channel.id.toString())							// join socket room
		}
		return channel
	}

	async leaveChannel(user: User, data: CreateMessageDto, client: Socket): Promise<Channel> {
		let channel = await this.channelService.findOneById(data.target_id);
		if (channel != null)
			client.leave(channel.id.toString())							// leave socket room
		return channel
	}

	async newMessage(user: User, messageDto: CreateMessageDto, server: Server) {
		let message: Message;
		try {
			message = await this.channelService.handleMessage(user, messageDto)
		} catch (error) {
			console.log(error);
			return
		}
		console.log("NewMessage:")
		console.log(message)

		// manage block users
		const socket_id = await server.to(message.target_id.toString()).allSockets()

		let except = [];
		for (let item of socket_id) {
			let other_user = await this.userService.findUsersBySocketId(item)
			if (other_user && other_user.blocked.find(e => { return e.id == user.id }) != undefined)
				except.push(item)
		}
		console.log(except)
		server.to(message.target_id.toString()).except(except).emit('NewMessage', message);
	}

	async invite(user: User, messageDto: CreateMessageDto, server: Server) {
		let message = await this.channelService.handleMessage(user, messageDto)
		let target = await this.userService.findUsersById(message.target_id);
		let channel = await this.channelService.findOneByName(message.content)

		if (target == null || channel == null) return

		this.channelService.addInvite(channel.id, messageDto.target_id)
		server.to(target.socket_id).emit('invite', message);
	}

	async setSocket(user: User, client: Socket) {
		this.userService.updateSocket(user, client.id);
	}

	async privateMessage(user: User, messageDto: CreateMessageDto, server: Server): Promise<Message> {
		let target = await this.userService.findUsersById(messageDto.target_id)
		let message = await this.channelService.createMessage(user, messageDto);
		server.to(target.socket_id).emit('PrivateMessage', message);
		return message
	}
}
