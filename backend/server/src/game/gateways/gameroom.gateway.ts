import { Inject, Logger, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Request } from "express";
import { Server, Socket } from "socket.io";
import { WsJwtAuthGuard } from "src/auth/guards/ws-jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { AvatarStatusGateway } from "src/users/gateways/avatarstatus.gateway";
import { GameRoomClass, GAMEROOMSTATUS } from "../classes/gameroom.class";
import { PlayerClass } from "../classes/player.class";
import { PlayerInfo } from "../interfaces/playerinfo.interface";
import { GameRoomService } from "../services/gameroom.service";

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private gameRoomService: GameRoomService
	) { }

	@WebSocketServer() server: Server;

	@Inject(AvatarStatusGateway)
	private gatewayStatus: AvatarStatusGateway;

	private logger: Logger = new Logger("gameRoomGateway");

	handleDisconnect(@ConnectedSocket() client: Socket): void {
		this.logger.log(`Client ${client.id} disconnected from room`);
		this.leaveRoom(this.gameRoomService.getRoomNameByPlayerId(client.id), client);
	}

	handleConnection(client: Socket, ...args: any[]): void {
		this.logger.log(`Client ${client.id} connected to gameroom`);
	}

	emitPlayersToRoom(roomid: string, gameRoom: GameRoomClass): void {
		for (const [key, value] of gameRoom.mapPlayers) {
			var info_player: PlayerInfo = gameRoom.getPlayerInfoById(key)
			this.server.to(roomid).emit("infouserp" + info_player.player_number, info_player);
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('launchGame')
	launchGame(@MessageBody() data: string): void {
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(data);
		gameRoom.begin_date = new Date();
		gameRoom.begin_date.toLocaleDateString();
		gameRoom.status = GAMEROOMSTATUS.INGAME;
		this.server.to(data).emit("gamestart", data);
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('leaveRoom')
	leaveRoom(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(data);
		if (gameRoom === undefined) {
			this.logger.log("The room does not exist anymore")
		}
		else if (gameRoom.status !== GAMEROOMSTATUS.INGAME) {
			client.leave(data);
			const player: PlayerClass = gameRoom.getPlayerById(client.id);
			if (player) {
				this.server.to(data).emit("p" + player.player_number + "leaving", {});
				this.gatewayStatus.onConnection(player.userid);
			}
			gameRoom.deletePlayer(client.id);
			if (gameRoom.nbPlayer === 1 && gameRoom.status === GAMEROOMSTATUS.FULL)
				gameRoom.status = GAMEROOMSTATUS.WAITING;
			else {
				this.gameRoomService.deleteRoom(data);
			}
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@Req() req: Request, @MessageBody() roomid: string, @ConnectedSocket() client: Socket): void {
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(roomid);
		if (gameRoom === undefined) {
			client.emit("change_room");
			return;
		}
		else if (gameRoom.status === GAMEROOMSTATUS.INGAME)
			client.emit("gamestart");
		client.join(roomid);
		if (gameRoom.status != GAMEROOMSTATUS.FULL && gameRoom.status != GAMEROOMSTATUS.INGAME)
			gameRoom.status = GAMEROOMSTATUS.WAITING;
		if (gameRoom.nbPlayer < this.gameRoomService.getPPG()) {
			const user: User = { ... (req.user as User) };
			gameRoom.addPlayerToRoom(client.id, user);
			this.gatewayStatus.waiting(user.id);
			if (gameRoom.nbPlayer === 2) {
				gameRoom.status = GAMEROOMSTATUS.FULL;
			}
		}
		this.emitPlayersToRoom(roomid, gameRoom);
	}
}
