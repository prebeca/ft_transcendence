import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

const padHeight = 68;

@WebSocketGateway(42042, {cors: {
	origin: process.env.APPLICATION_REDIRECT_URI,
	credentials: true
	}
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger("gameGateway");

	pad1y: number;
	pad2y: number;
	ballx: number;
	bally: number;
	canvasx: number;
	canvasy: number;


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
	initPads(client: Socket, data: any) {
		this.canvasx = data.width;
		this.canvasy = data.height;
		this.pad1y = data.height / 2 - padHeight / 2;
		this.pad2y = data.height / 2 - padHeight / 2;
		this.ballx = data.width / 2;
		this.bally = data.height / 2;
		this.server.emit("drawPad", 1, this.pad1y);
		this.server.emit("drawPad", 2, this.pad2y);
		this.server.emit("drawBall", this.ballx, this.bally);
	}

	@SubscribeMessage('ArrowUp')
	// padUp(client: Socket, pos: number) {
	padUp(client: Socket) {
		// console.log("pad1y avant = "+this.pad1y);
		if (this.pad1y > 10)
			this.pad1y -= 10;
		else
			this.pad1y = 0;
		// console.log("pad1y apres = "+this.pad1y);
		this.server.emit("drawPad", 1, this.pad1y);
	}

	@SubscribeMessage('ArrowDown')
	// padUp(client: Socket, pos: number) {
	padDown(client: Socket) {
		// console.log("pad1y avant = "+this.pad1y);
		if (this.pad1y < this.canvasy - padHeight)
			this.pad1y += 10;
		else
			this.pad1y = this.canvasy - padHeight;
		// console.log("pad1y apres = "+this.pad1y);
		this.server.emit("drawPad", 1, this.pad1y);
	}

	// @SubscribeMessage('msgToServer')
	// handleMessage(client: Socket, message: string): void {
	// 	console.log(message);
	// 	this.server.emit('msgToClient', message);
	// }
}
