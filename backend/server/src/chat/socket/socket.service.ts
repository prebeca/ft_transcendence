import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { Channel, User } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { Message } from '../channels/entities/message.entity';

@Injectable()
export class SocketService {
	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	async joinChannel(user: User, data: any, client: Socket, server: Server) {
		// let channel = await this.channelService.findOneById(data.channel_id);
		// if (channel == null)
		// 	return null

		let res = await this.channelService.joinChannel(user, data);
		if (typeof (res) == "string") {
			client.emit("Alert", { content: "ERROR: " + res, color: "red" })
			return null
		}
		let channel = res as Channel;
		channel.password = undefined;
		client.to(channel.id.toString()).emit("NewUser", { user: user, channel_id: channel.id })

		const socket_ids = await server.to(channel.id.toString()).allSockets()
		if (!socket_ids.has(user.socket_id)) {
			client.join(channel.id.toString())							// join socket room
		}
		channel.messages = channel.messages.filter(msg => { return (user.blocked.find(blocked_user => { return blocked_user.id == msg.user.id }) == undefined) });
		client.emit("JoinChan", channel)
		return channel
	}

	async leaveChannel(user: User, data: any, client: Socket) {
		let channel = await this.channelService.findOneById(data.channel_id);
		if (channel == null)
			return undefined;

		client.leave(channel.id.toString())
		this.channelService.leaveChannel(user, data);
		client.emit("LeaveChan", { channel_id: channel.id })
		client.to(channel.id.toString()).emit("UserLeft", { channel_id: channel.id, user_id: user.id })
		channel.password = undefined;
		return channel
	}

	async deleteChannel(user: User, data: any, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);

		if (channel.owner.id != user.id)
			return;

		server.to(channel.id.toString()).emit("ChannelDeleted", channel.id)
		this.channelService.deleteChannel(channel.id);
	}

	async newMessage(user: User, message: Message, server: Server) {
		let channel = await this.channelService.findOneById(message.channel.id);

		message.channel.scope = "channel.scope"
		let muted = channel.muted.find(e => { return e.user.id == user.id });
		if (muted != undefined) {
			if (muted.end > new Date()) {
				server.to(user.socket_id).emit('Alert', {
					color: "red",
					content: "You are still muted for " + ((muted.end.valueOf() - (new Date()).valueOf()) / (60 * 1000)).toFixed() + " minutes",
				});

				return; // user is muted on the target channel
			}
			else
				this.channelService.removeFromMuteList(muted)
		}

		try {
			message = await this.channelService.handleMessage(user, message)
		} catch (error) {
			return
		}

		// manage block users
		const socket_ids = await server.to(channel.id.toString()).allSockets()

		let except = [];
		for (let item of socket_ids) {
			let other_user = await this.userService.findUsersBySocketId(item)
			if (other_user && other_user.blocked.find(e => { return e.id == user.id }) != undefined)
				except.push(item)
		}
		server.to(channel.id.toString()).except(except).emit('NewMessage', message);
		if (channel.scope == 'dm')
			server.to(channel.id.toString()).except(except).emit('NewMessageDM', message);
	}

	async invite(user: User, data: any, server: Server, client: Socket) {
		let target = await this.userService.findUsersById(data.target_id);
		let channel = await this.channelService.findOneById(data.channel_id)

		if (target == null || channel == null) return

		if (channel.users.find(e => { return e.id == target.id }) != undefined) {
			client.emit("Alert", { content: "User already in channel", color: "red" })
			return;
		}

		if (channel.admins.find(e => { return e.id == user.id }) == undefined) {
			client.emit("Alert", { content: "Invite require admin rights", color: "red" })
			return;
		}
		if (user.blocked.find(e => { return e.id == target.id }) != undefined || target.blocked.find(e => { return e.id == user.id }) != undefined) {
			client.emit("Alert", { content: "You can't invite this player.", color: "red" })
			return;
		}
		let ban = channel.banned.find(e => { return e.user.id == target.id })
		if (ban != undefined) {
			if (ban.end > new Date()) {
				client.emit("Alert", { content: "This player is banned from this channel.", color: "red" })
				return;
			}
			this.channelService.removeFromBanList(ban);
		}

		this.channelService.addInvite(channel.id, target.id)
		server.to(target.socket_id).emit("Alert", { content: user.username + " has invited you to " + channel.name + " channel !", color: "blue" })
	}

	async setSocket(user: User, client: Socket) {
		this.userService.updateSocket(user, client.id);
	}

	async unsetSocket(user: User) {
		this.userService.updateSocket(user, null);
	}

	async newDMChannel(user: User, target_id: number, server: Server, client: Socket): Promise<Channel | string> {
		let target_user = await this.userService.findUsersById(target_id);

		if (target_user.id == user.id) {
			client.emit("Alert", { content: "Error: user and target are the same", color: "red" })
			return
		}

		if (user.blocked.find(e => { return e.id == target_user.id })) {
			client.emit("Alert", { content: "DM target is blocked", color: "red" })
			return
		}

		if (target_user.blocked.find(e => { return e.id == user.id })) {
			client.emit("Alert", { content: "Unable to DM this user", color: "red" })
			return
		}

		if (await this.channelService.findOneByName("dm_" + user.id + "_" + target_user.id) != null || await this.channelService.findOneByName("dm_" + target_user.id + "_" + user.id) != null) {
			client.emit("Alert", { content: "DM channel already exist", color: "red" })
			return
		}

		let channel = await this.channelService.createChannel(user, { scope: "dm", name: "dm_" + user.id + "_" + target_user.id, password: "" })
		if (typeof (channel) == "string")
			return channel;

		await this.channelService.joinChannel(target_user, { channel_id: channel.id, password: "" });
		await this.joinChannel(user, { channel_id: channel.id, password: "" }, client, server)
		server.to(target_user.socket_id).emit('PrivateMessage', { id: -1, channel: channel, user: null, content: user.username + "Invited you to chat !" });
		return channel
	}

	async setAdmin(user: User, data, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);
		if (channel.owner == null || channel.owner.id != user.id)
			return; // user not channel owner
		let new_admin = await this.channelService.addAdmin(data.channel_id, data.user_id);
		if (new_admin != null)
			server.to(data.channel_id).emit('NewMessage', {
				id: -1,
				channel: channel,
				user: { username: "Info" },
				content: new_admin.username + " is now Admin ! Congrats !",
			});
		server.to(new_admin.socket_id).emit("Promoted", data)
	}

	async kick(user: User, data: any, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);
		let target = await this.userService.findUsersById(data.user_id);

		if (channel == null || target == null)
			return;

		let userIsAdmin: boolean = (channel.admins.find(e => { return e.id == user.id }) != undefined ? true : false)
		let userIsOwner: boolean = (user.id == channel.owner.id ? true : false)

		let targetIsAdmin: boolean = (channel.admins.find(e => { return e.id == target.id }) != undefined ? true : false)
		let targetIOwner: boolean = (target.id == channel.owner.id ? true : false)

		if (userIsAdmin == false)
			return; // return if user is not admin

		if (targetIOwner == true)
			return; // return if target is owner

		if (targetIsAdmin && !userIsOwner)
			return; // admin cant kick admin but owner can

		server.to(channel.id.toString()).emit('NewMessage', {
			id: -1,
			channel: channel,
			user: { username: "Info" },
			content: target.username + " has been kicked ! So sad !",
		});

		await this.userService.removeChannel(target.id, channel);
		await this.channelService.removeUser(channel.id, target.id);

		server.in(target.socket_id).socketsLeave(channel.id.toString());

		server.to(target.socket_id).emit('UserKick', data);
		server.to(data.channel_id).emit('Kick', data);

	}

	async ban(user: User, data: any, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);
		let target = await this.userService.findUsersById(data.user_id);

		if (channel == null || target == null)
			return;

		let userIsAdmin: boolean = (channel.admins.find(e => { return e.id == user.id }) != undefined ? true : false)
		let userIsOwner: boolean = (user.id == channel.owner.id ? true : false)

		let targetIsAdmin: boolean = (channel.admins.find(e => { return e.id == target.id }) != undefined ? true : false)
		let targetIOwner: boolean = (target.id == channel.owner.id ? true : false)

		if (userIsAdmin == false)
			return; // return if user is not admin

		if (targetIOwner == true)
			return; // return if target is owner

		if (targetIsAdmin && !userIsOwner)
			return; // admin cant kick admin but owner can

		if (await this.channelService.addToBanList(data) == null)
			return; // target already ban

		server.to(data.channel_id).emit('NewMessage', {
			id: -1,
			channel: channel,
			user: { username: "Info" },
			content: target.username + " has been Banned for " + data.duration + " minutes ! See you never !",
		});


		await this.userService.removeChannel(data.user_id, channel);
		await this.channelService.removeUser(data.channel_id, data.user_id);

		server.in(target.socket_id).socketsLeave(channel.id.toString());

		server.to(target.socket_id).emit('UserKick', data);
		server.to(data.channel_id).emit('Kick', data);
	}

	async mute(user: User, data: any, server: Server) {
		let channel = await this.channelService.findOneById(data.channel_id);
		let target = await this.userService.findUsersById(data.user_id);

		if (channel == null || target == null)
			return;

		let userIsAdmin: boolean = (channel.admins.find(e => { return e.id == user.id }) != undefined ? true : false)
		let userIsOwner: boolean = (user.id == channel.owner.id ? true : false)

		let targetIsAdmin: boolean = (channel.admins.find(e => { return e.id == target.id }) != undefined ? true : false)
		let targetIOwner: boolean = (target.id == channel.owner.id ? true : false)

		if (userIsAdmin == false)
			return; // return if user is not admin

		if (targetIOwner == true)
			return; // return if target is owner

		if (targetIsAdmin && !userIsOwner)
			return; // admin cant kick admin but owner can

		if (await this.channelService.addToMuteList(data) == null)
			return; // already muted

		server.to(data.channel_id).emit('NewMessage', {
			id: -1,
			channel: channel,
			user: { username: "Info" },
			content: target.username + " has been muted for " + data.duration + " minutes ! Finally some silence !",
		});

	}

	async deleteMessage(user: User, message: Message, server: Server) {
		let channel = await this.channelService.findOneById(message.channel.id)

		if (message.id == -1)
			return;

		if (message.user.id != user.id) {
			if (channel.admins.find(e => { return (e.id == user.id) }) == undefined)
				return; // not admin

			if (channel.messages.find(e => { return e.id == message.id }) == undefined)
				return; // message not found in channel
		}

		this.channelService.deleteMessage(message.id);
		server.to(channel.id.toString()).emit("DeleteMessage", message);
	}

}
