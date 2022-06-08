import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Body, Logger, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { User } from 'src/typeorm';


@WebSocketGateway({
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class AvatarStatusGateway {
	constructor() { }

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger("avatarStatusGateway");

	afterInit(server: Server) {
		this.logger.log("avatar status socket init !");
	}

	handleDisconnect(client: Socket) {
		console.log(`Client ${client.id} disconnected from avatar status`);
	}


	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client ${client.id} connected to avatar status`);
	}

}
