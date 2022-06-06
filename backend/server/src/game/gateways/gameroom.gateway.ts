import { InternalServerErrorException, Logger, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtAuthGuard } from "src/auth/guards/ws-jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { GameRoomClass, GAMEROOMSTATUS } from "../classes/gameroom.class";
import { PlayerClass } from "../classes/player.class";
import { GameRoomService } from "../services/gameroom.service";
import { PlayerInfo } from "../interfaces/playerinfo.interface";

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

	private logger: Logger = new Logger("gameRoomGateway"); // no idea what use it has

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(`Client ${client.id} disconnected from room`);
		this.gameRoomService.removePlayerFromRooms(client.id);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client ${client.id} connected to gameroom`);
	}

	emitPlayersToRoom(roomid: string, gameRoom: GameRoomClass) {
		for (const [key, value] of gameRoom.mapPlayers) { //will send to every member the informations of every player present
			var info_player: PlayerInfo = gameRoom.getPlayerInfoById(key)
			this.server.to(roomid).emit("infouserp" + info_player.player_number, info_player);
		}
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('launchGame')
	launchGame(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(data);
		gameRoom.status = GAMEROOMSTATUS.INGAME;
		this.server.to(data).emit("gamestart", data);
	}

	/*
	** Client leaves room (it can be a player => the information will be send to the other player and spectators)
	** It can be a spectator, nothing of note happens
	*/
	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('leaveRoom')
	leaveRoom(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		client.leave(data);
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(data);
		if (gameRoom === undefined)
			throw new InternalServerErrorException("The room does not exist anymore");
		if (gameRoom.status === GAMEROOMSTATUS.INGAME) {
			console.log("starting game");
			return;
		}
		else {
			const player: PlayerClass = gameRoom.getPlayerById(client.id);
			if (player) {
				console.log("sending pleaving");
				this.server.to(data).emit("p" + player.player_number + "leaving", {});
			}
			gameRoom.deletePlayer(client.id);
		}
		client.disconnect(true);
	}

	/*
	** Client joins room 
	** The first two client will be players
	** The following ones (if there are) will be spectators
	*/
	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@Req() req, @MessageBody() roomid: string, @ConnectedSocket() client: Socket) {
		client.join(roomid);
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(roomid);
		if (gameRoom === undefined)
			throw new InternalServerErrorException("The room does not exist anymore");
		gameRoom.status = GAMEROOMSTATUS.WAITING;
		if (gameRoom.nbPlayer < this.gameRoomService.getPPG()) {
			const user: User = { ... (req.user as User) };
			gameRoom.addPlayerToRoom(client.id, user);
		}
		console.log(gameRoom);
		this.emitPlayersToRoom(roomid, gameRoom);
	}
}
