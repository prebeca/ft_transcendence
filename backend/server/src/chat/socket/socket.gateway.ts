import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Channel } from 'diagnostics_channel';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { SocketService } from './socket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { User } from 'src/typeorm';
import { MessageData } from '../channels/entities/message.entity';


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
	async joinChannel(@Req() req: Request, @MessageBody() data: MessageData, @ConnectedSocket() client: Socket) {
		let user = req.user as User;
		return await this.socketService.joinChannel(user, data, client)
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('NewMessage')
	async newMessage(@Req() req: Request, @MessageBody() data: MessageData, @ConnectedSocket() client: Socket) {
		let user = req.user as User;
		return await this.socketService.newMessage(user, data, client, this.server)
	}

}
