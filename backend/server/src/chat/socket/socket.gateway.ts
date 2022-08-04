import { Req, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { Channel, User } from 'src/typeorm';
import { Message } from '../channels/entities/message.entity';
import { SocketService } from './socket.service';


@WebSocketGateway({
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class SocketGateway {
	constructor(private readonly socketService: SocketService) { }

	@WebSocketServer()
	server: Server;

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('disconnect')
	async disconnect(@Req() req: Request, @MessageBody() data: any, @ConnectedSocket() client: Socket) {
		console.log(req.user["username"] + " disconnected !");
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('Alert')
	async alert(@Req() req: Request, @MessageBody() data: any) {
		this.server.to((req.user as User).socket_id).emit("Alert", data)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('JoinChan')
	async joinChannel(@Req() req: Request, @MessageBody() data: any, @ConnectedSocket() client: Socket) {
		return this.socketService.joinChannel(req.user as User, data, client, this.server)
	}


	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('LeaveChan')
	async leaveChannel(@Req() req: Request, @MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<Channel> {
		return this.socketService.leaveChannel(req.user as User, data, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('DeleteChan')
	async deleteChannel(@Req() req: Request, @MessageBody() data: any, @ConnectedSocket() client: Socket) {
		this.socketService.deleteChannel(req.user as User, data, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('NewMessage')
	async newMessage(@Req() req: Request, @MessageBody() message: Message, @ConnectedSocket() client: Socket) {
		return this.socketService.newMessage(req.user as User, message, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('Invite')
	async invite(@Req() req: Request, @MessageBody() data: any, @ConnectedSocket() client: Socket) {
		let user = req.user as User;
		return this.socketService.invite(user, data, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('SetSocket')
	async updateSocket(@Req() req: Request, @ConnectedSocket() client: Socket) {
		return this.socketService.setSocket(req.user as User, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('SetAdmin')
	async setAdmin(@Req() req: Request, @MessageBody() message: Message, @ConnectedSocket() client: Socket) {
		return this.socketService.setAdmin(req.user as User, message, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('DeleteMessage')
	async deleteMessage(@Req() req: Request, @MessageBody() message: Message) {
		return this.socketService.deleteMessage(req.user as User, message, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('NewDMChannel')
	async newDMChannel(@Req() req: Request, @MessageBody() id: number, @ConnectedSocket() client: Socket) {
		return await this.socketService.newDMChannel(req.user as User, id, this.server, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('Kick')
	async kick(@Req() req: Request, @MessageBody() data, @ConnectedSocket() client: Socket) {
		return this.socketService.kick(req.user as User, data, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('Ban')
	async ban(@Req() req: Request, @MessageBody() data, @ConnectedSocket() client: Socket) {
		return this.socketService.ban(req.user as User, data, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('Mute')
	async mute(@Req() req: Request, @MessageBody() data, @ConnectedSocket() client: Socket) {
		return this.socketService.mute(req.user as User, data, this.server)
	}
}
