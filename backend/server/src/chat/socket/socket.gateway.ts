import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { SocketService } from './socket.service';
import { Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { User, Channel } from 'src/typeorm';
import { Message } from '../channels/entities/message.entity';
import { CreateMessageDto } from '../channels/dto/messages.dto';


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
	@SubscribeMessage('JoinChan')
	async joinChannel(@Req() req: Request, @MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket) {
		return this.socketService.joinChannel(req.user as User, data, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('LeaveChan')
	async leaveChannel(@Req() req: Request, @MessageBody() data: CreateMessageDto, @ConnectedSocket() client: Socket): Promise<Channel> {
		return this.socketService.leaveChannel(req.user as User, data, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('NewMessage')
	async newMessage(@Req() req: Request, @MessageBody() messageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
		return this.socketService.newMessage(req.user as User, messageDto, this.server)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('invite')
	async invite(@Req() req: Request, @MessageBody() messageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
		let user = req.user as User;
		return this.socketService.invite(user, messageDto, this.server)
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
	@SubscribeMessage('PrivateMessage')
	async privateMessage(@Req() req: Request, @MessageBody() messageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
		return this.socketService.privateMessage(req.user as User, messageDto, this.server)
	}

}
