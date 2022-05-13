import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway(42042, {cors: {
	origin: "http://localhost:8080",
	credentials: true
	}
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);

	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client connected:    ${client.id}`);
	}

	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, message: string): void {
		console.log(message);
		this.server.emit('msgToClient', message);
	}
}
