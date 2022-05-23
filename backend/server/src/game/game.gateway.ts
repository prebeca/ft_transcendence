import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameService } from "./game.service";
import GameI from "./gameI.interface";

const gameWidth = 640;
const gameHeight = 480;
const padWidth = 10;
const padHeight = 100;
const ballradius = 7;
const padSpeed = 10;

function initGame(game: GameI, data: any) {
	game.canvasWidth = data.width / 2;
	game.canvasHeight = data.height / 2;
	game.ratiox = gameWidth / game.canvasWidth;
	game.ratioy = gameHeight / game.canvasHeight;
	game.pad1x = game.canvasWidth / 10 - padWidth;
	game.pad1y = game.canvasHeight / 2 - game.pad1Height / 2;
	game.pad2x = game.canvasWidth - game.canvasWidth / 10;
	game.pad2y = game.canvasHeight / 2 - game.pad2Height / 2;
	game.ballx = game.canvasWidth / 2;
	game.bally = game.canvasHeight / 2;
	game.pad1Width = padWidth;
	game.pad1Height = padHeight;
	game.pad1Speed = padSpeed;
	game.pad2Width = padWidth;
	game.pad2Height = padHeight;
	game.pad2Speed = padSpeed;
	game.ballr = ballradius;
	console.log("dans init");
}

@WebSocketGateway(42042, {cors: {
	origin: process.env.APPLICATION_REDIRECT_URI,
	credentials: true
	}
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	game = {} as GameI;

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger("gameGateway");

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

	@SubscribeMessage('initGame')
	initGame(client: Socket, data: any) {
		initGame(this.game, data);
		this.server.emit("initGame", this.game);
	}

	@SubscribeMessage('updateDimensions')
	updateDimensions(client: Socket, data: any) {
		let previousW = this.game.canvasWidth;
		let previousH = this.game.canvasHeight;

		this.game.canvasWidth = data.width / 2;
		this.game.canvasHeight = data.height / 2;

		const ratx = this.game.canvasWidth / previousW;
		const raty = this.game.canvasHeight / previousH;

		// this.game.ratiox *= gameWidth / this.game.canvasWidth;
		// this.game.ratioy *= gameHeight / this.game.canvasHeight;
		// const ratx = this.game.ratiox;
		// const raty = this.game.ratioy;

		this.game.pad1x *= ratx;
		this.game.pad1y *= raty;
		this.game.pad1Width *= ratx;
		this.game.pad1Height *= raty;
		this.game.pad1Speed *= raty;
		this.game.pad2x *= ratx;
		this.game.pad2y *= raty;
		this.game.pad2Width *= ratx;
		this.game.pad2Height *= raty;
		this.game.pad2Speed *= raty;
		this.game.ballx *= ratx;
		this.game.bally *= raty;
		console.log("speed = " + this.game.pad1Speed);
		this.server.emit("updateDimensions", this.game);
	}

	@SubscribeMessage('arrowUp')
	padUp(client: Socket) {
		if (this.game.pad1y > padSpeed)
			this.game.pad1y -= padSpeed;
		else
		this.game.pad1y = 0;
		this.server.emit("updatePad", this.game.pad1y);
	}

	@SubscribeMessage('arrowDown')
	padDown(client: Socket) {
		if (this.game.pad1y < this.game.canvasHeight - this.game.pad1Height - padSpeed)
			this.game.pad1y += padSpeed;
		else
			this.game.pad1y = this.game.canvasHeight - this.game.pad1Height;
		this.server.emit("updatePad", this.game.pad1y);
	}






	// @SubscribeMessage('msgToServer')
	// handleMessage(client: Socket, message: string): void {
	// 	console.log(message);
	// 	this.server.emit('msgToClient', message);
	// }
}
