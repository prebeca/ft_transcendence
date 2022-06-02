import { Logger, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtAuthGuard } from "src/auth/guards/ws-jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { GameRoomClass } from "../classes/gameroom.class";
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

	@WebSocketServer()
	server2 = new Server();

	private logger: Logger = new Logger("gameRoomGateway"); // no idea what use it has

	afterInit(server2: Server) {
		this.logger.log("gameroom socket init !");
		this.gameRoomService.clear();
	}

	/*
	** If the spectator disconnects, it does nothing BUT if a player disconnects, what then ?
	*/
	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		this.gameRoomService.removePlayerFromRooms(client.id);
	}

	handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log(`Client connected:    ${client.id}`);
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@Req() req, @MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const user: User = { ... (req.user as User) };

		client.join(data); //Should use interfaces for it instead of this json (same but not clear)
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(data); //get the object representing the room that the player OR spectator just joined
		console.log(gameRoom);
		if (gameRoom.nbPlayer < this.gameRoomService.getPPG()) { //add user to room (spectator or otherwise) but not to the gameroom object if spectator
			gameRoom.addPlayerToRoom(client.id, user); //adds the player to the map in the gameRoom object (to keep track of him)
		}
		for (const [key, value] of gameRoom.mapPlayers) { //will send to every member the informations of every player present

			this.server2.to(data).emit("infouserp" + value.player_number, {
				username: value.username,
				avatar: value.avatar,
				level: value.level,
				losses: value.losses,
				wins: value.wins,
				mmr: value.mmr,
			});
		}
	}
}
