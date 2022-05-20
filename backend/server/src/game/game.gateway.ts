import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import  PadI  from "./pad.interface"

// let pad1 = {
// 	x: 0,
// 	y: 0,
// 	width: 10,
// 	height: 100,
// };

let pad2: {
	x: number,
	y: number,
	width: 10,
	height: 100,
};
let ball: {
	x: number,
	y: number,
	r: 5,
	speed: 1,
};

@WebSocketGateway(42042, {cors: {
	origin: process.env.APPLICATION_REDIRECT_URI,
	credentials: true
	}
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger("gameGateway");


	pad1: PadI;


	afterInit(server: Server) {
		this.logger.log("game socket init !");
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);

	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client connected id:			${client.id}`);
		console.log('Client connected username:		' + client.handshake.query.username);
	}

	// @SubscribeMessage('setUpPads')
	// setUpPads(width: number, height: number) {
	// 	// pad1.x = width;
	// 	// pad1.y = height / 10;
	// 	// pad1.width = width / 6,
	// 	// pad1.height = height / 4,
	// 	this.server.emit("pad1", pad1);
	// 	this.server.emit("pad2", pad2);
	// }




	@SubscribeMessage('initPads')
	initPads(client: Socket, width: number, height: number) {
		this.pad1.x = 0;
		this.pad1.y = height / 2 - this.pad1.height / 2;
		pad2.x = width - pad2.width;
		pad2.y = height / 2 - pad2.height / 2;
		ball.x = width / 2;
		ball.y = height / 2;
		this.server.emit("drawPad", this.pad1);
		this.server.emit("drawPad", pad2);
		this.server.emit("drawBall", ball);
		console.log("iciiiiiiiiiiiiiiiiiiiiiiii");
	}



	// @SubscribeMessage('msgToServer')
	// handleMessage(client: Socket, message: string): void {
	// 	console.log(message);
	// 	this.server.emit('msgToClient', message);
	// }
}
