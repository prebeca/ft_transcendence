import { Logger, Req, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from '../../auth/guards/ws-jwt-auth.guard';
import { User } from '../entities/user.entity';

@WebSocketGateway(42040, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class AvatarStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	) { }

	@WebSocketServer()
	server: Server;
	private logger: Logger = new Logger("avatarStatusGateway");
	private user_socket: Map<number, string> = new Map<number, string>();
	private status: Map<number, string> = new Map<number, string>();

	afterInit(server: Server): void {
		this.logger.log("avatar status socket init !");
	}

	handleDisconnect(client: Socket): void {
		this.logger.log(`Client ${client.id} disconnected from avatar status`);
		for (const [key, value] of this.user_socket) {
			if (value === client.id) {
				this.server.emit("changeStatus" + key, "disconnected")
				this.user_socket.delete(key);
				this.status.delete(key);
			}
		}
	}

	handleConnection(client: Socket, ...args: any[]): void {
		this.logger.log(`Client ${client.id} connected to avatar status`);
	}

	onConnection(userid: number): void {
		this.logger.log("onConnection " + userid);
		this.user_socket.set(userid, "");
		this.status.set(userid, "connected");
		this.logger.log("reseting new client id for user " + userid);
		this.server.emit("changeStatus" + userid, this.status.get(userid));
	}

	backToConnected(userid: number): void {
		this.status.set(userid, "connected");
		this.server.emit("changeStatus" + userid, this.status.get(userid));
	}

	inGame(userid: number): void {
		this.logger.log("inGame " + userid);
		this.status.set(userid, "inGame");
		this.server.emit("changeStatus" + userid, this.status.get(userid));
	}

	waiting(userid: number): void {
		this.logger.log("inGameRoom " + userid);
		this.status.set(userid, "inGameRoom");
		this.server.emit("changeStatus" + userid, this.status.get(userid));
	}

	changingAvatar(userid: number, new_filename: string): void {
		this.logger.log(userid + " changed avatar");
		this.server.emit("changeAvatar" + userid, new_filename);
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage("information")
	emitInformationToUser(@Req() req: Request, @MessageBody() user_id: number, @ConnectedSocket() client: Socket): void {
		const user: User = { ...req.user as User };

		this.logger.log("user_id " + user_id);
		if (user.id === user_id) {
			this.user_socket.set(user.id, client.id);
		}
		var status: string = "";
		if (this.user_socket.has(user_id)) {
			status = this.status.get(user_id);
			if (!status)
				status = "connected";
		}
		else
			status = "disconnected";

		client.emit("changeStatus" + user_id, status);
	}
}
