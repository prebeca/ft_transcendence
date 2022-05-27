import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameRoomClass, PlayerClass } from "../classes/player.class";

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private gameRoom: GameRoomClass) { }

	@WebSocketServer()
	server2: Server = new Server();

	private readonly ppr: number = 2; //ppr = player per room
	private id_room: number = 1;
	private rooms: string[] = [];
	private logger: Logger = new Logger("gameRoomGateway");

	afterInit(server2: Server) {
		this.logger.log("gameroom socket init !");
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		this.gameRoom.deletePlayer(client.id);
	}

	handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log(`Client connected:    ${client.id}`);
		this.gameRoom.addPlayerToRoom(client.id);
	}

	@SubscribeMessage('createRoom')
	createRoom(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		if (this.rooms.indexOf(data) === -1) {
			console.log("creation of room named: " + data);
			this.rooms.push(data);
		}
		else {
			console.log("joining a room named: " + data);
		}
		client.join(data);
	}
}
