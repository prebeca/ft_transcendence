import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Channel } from 'diagnostics_channel';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Message } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { SocketService } from './socket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';


@WebSocketGateway({ cors: true })
export class SocketGateway {
	constructor(private readonly socketService: SocketService) { }

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('JoinChan')
	async joinChannel(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
		return await this.socketService.joinChannel(data, client)
	}

	@SubscribeMessage('MessageSend')
	async handleMsgDistrib(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
		return await this.socketService.handleMsgDistrib(data, client, this.server)
	}

}
