import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server2: Server = new Server();

	private logger: Logger = new Logger("gameRoomGateway");

	afterInit(server2: Server) {
		this.logger.log("gameroom socket init !");
	}

	handleDisconnect(client: Socket) {
		console.log(`Client eeeeeeeee disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client eeeeeeeeeeee connected:    ${client.id}`);
	}


	@SubscribeMessage('initGameRoom')
	initGameRoom(client: Socket, data: any) {
		this.server2.emit("handshake", "lol");
		console.log(`client:  ${client.id}`)
	}
}
