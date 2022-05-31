import { ContextType, Inject, Logger, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { WsJwtAuthGuard } from "src/auth/guards/ws-jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { GameRoomClass } from "../classes/gameroom.class";
import { PlayerClass } from "../classes/player.class";
import { Player } from "../entities/player.entity";

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	) { }

	@WebSocketServer()
	server2: Server = new Server();

	private readonly ppr: number = 2;
	private id_room: number = 1;
	private rooms: string[] = [];
	private logger: Logger = new Logger("gameRoomGateway");

	private gameRooms: Map<string, GameRoomClass> = new Map<string, GameRoomClass>();

	afterInit(server2: Server) {
		this.logger.log("gameroom socket init !");
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		//this.gameRoom.deletePlayer(client.id);
	}

	handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log(`Client connected:    ${client.id}`);
		//this.gameRoom.addPlayerToRoom(client.id);
	}

	createRoom(roomname: string) {
		console.log("creation of room named: " + roomname);
		this.rooms.push(roomname);
		let gameRoom: GameRoomClass = new GameRoomClass();
		gameRoom.roomname = roomname;
		this.gameRooms.set(roomname, gameRoom);
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@Req() req, @MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const user: User = { ... (req.user as User) };
		if (this.rooms.indexOf(data) === -1) {
			this.createRoom(data);
		}
		else {
			console.log("joining a room named: " + data);
		}
		let gameRoom: GameRoomClass = this.gameRooms.get(data);
		if (gameRoom.nbPlayer >= this.ppr)
			return;
		console.log('gameRoom' + gameRoom);
		gameRoom.addPlayerToRoom(client.id);
		console.log('gameRoom' + gameRoom);
		client.join(data);
		this.server2.emit("infouser", user);
	}
}
