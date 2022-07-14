import { Injectable, Scope, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { User, Channel } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { CreateMessageDto } from '../channels/dto/messages.dto';
import { Message } from '../channels/entities/message.entity';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(user: User, data: CreateMessageDto, client: Socket) {
		let channel = await this.channelService.findOneById(data.target_id);
		if (channel == null)
			return null

		if (await this.channelService.joinChannel(user, data) == null)
			return null

		client.to(channel.id.toString()).emit("NewUser", { user: user, channel_id: channel.id })
		client.join(channel.id.toString())							// join socket room
		client.emit("JoinChan", channel)
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
		const socket_ids = await server.to(message.target_id.toString()).allSockets()

		let except = [];
		for (let item of socket_ids) {
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
		server.to(user.socket_id).emit('PrivateMessage', message);
		server.to(target.socket_id).emit('PrivateMessage', message);
		return message
	}

	async setAdmin(user: User, data, server: Server) {
		let new_admin = await this.channelService.addAdmin(data.channel_id, data.user_id);
		if (new_admin != null)
			server.to(data.channel_id).emit('NewMessage', {
				id: -1,
				target_id: data.channel_id,
				user_id: -1,
				user_name: "Info",
				content: new_admin.username + " is now Admin ! Congrats !",
			});
	}

	async kick(user: User, data, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);
		let target = await this.userService.findUsersById(data.user_id);

		if (channel == null || target == null)
			return;

		if (channel.admins.find(e => { return e.id == user.id }) == undefined)
			return;

		this.userService.removeChannel(data.user_id, channel);
		this.channelService.removeUser(data.channel_id, data.user_id);

		server.in(target.socket_id).socketsLeave(channel.id.toString());

		server.to(target.socket_id).emit('UserKick', data);
		server.to(data.channel_id).emit('Kick', data);

		server.to(data.channel_id).emit('NewMessage', {
			id: -1,
			target_id: channel.id,
			user_id: -1,
			user_name: "Info",
			content: target.username + " has been kicked ! So sad !",
		});
	}

	async deleteMessage(user: User, message: Message, server: Server) {
		let channel = await this.channelService.findOneById(message.target_id)

		if (channel == undefined)
			return;	// not valid channel (probably DM channel)

		if (channel.admins.find(e => { return (e.id == user.id) }) == undefined)
			return; // not admin

		let messages = await this.channelService.getMessages(user, channel.id);
		if (messages.find(e => { return e.id == message.id }) == undefined)
			return; // message not found in channel

		this.channelService.deleteMessage(message.id);
		server.to(message.target_id.toString()).emit("DeleteMessage", message);
	}
}
