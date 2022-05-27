import { ContextType, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { setTimeout } from "timers/promises";
import { GameService } from "../services/game.service";
import GameI from "../interfaces/gameI.interface";

export enum GameStatus {
	WAITING = "waiting",
	INCOMPLETE = "incomplete",
	INPROGRESS = "in progress",
	PLAYER1WON = "player 1 won",
	PLAYER2WON = "player 2 won",
}

const gameWidth = 640;
const gameHeight = 480;
const padWidth = 10;
const padHeight = 100;
const ballRadius = 7;
const ballSpeed = 1;
const padSpeed = 20;
const pointToWin = 10;

function random_x_start(side: string) {
	let x = Math.random() * 0.5 + 0.5;
	if (side === "left")
		return (-x);
	if (side === "right")
		return (x);
	let tmp = Math.floor(Math.random() * 2);
	if (tmp == 1)
		return (-x);
	return (x);
}

function multiply_by_x(x: number, y: number, mult: number) {
	return ({ x: x * mult, y: y * mult })
}

function generate_random_start(side: string) {
	let x = random_x_start(side);
	let y = Math.sqrt(1 - x * x);
	let tmp = Math.floor(Math.random() * 2);
	if (tmp == 1)
		y = -y;
	return multiply_by_x(x, y, 10);
}

function checkCollision(game: GameI) {
	if (game.ballx - game.ballr <= 0) {
		game.score2++;
		if (game.score2 === pointToWin)
			return GameStatus.PLAYER2WON;
		game.ballx = game.canvasWidth / 2;
		game.bally = game.canvasHeight / 2;
		game.ballDir = generate_random_start("left");
	}
	else if (game.ballx + game.ballr >= game.canvasWidth) {
		game.score1++;
		if (game.score1 === pointToWin)
			return GameStatus.PLAYER1WON;
		game.ballx = game.canvasWidth / 2;
		game.bally = game.canvasHeight / 2;
		game.ballDir = generate_random_start("right");
	}
	else if (game.ballx - game.ballr <= game.pad1x + game.pad1Width && game.ballx + game.ballr >= game.pad1x) {
		if (game.bally - game.ballr <= game.pad1y + game.pad1Height && game.bally + game.ballr >= game.pad1y) {

			game.ballDir.x *= -1;

			if ((game.bally - game.ballr < game.pad1y + game.pad1Height && game.bally + game.ballr > game.pad1y + game.pad1Height ||
				game.bally + game.ballr > game.pad1y && game.bally - game.ballr < game.pad1y) &&
				game.ballx - game.ballr < game.pad1x + game.pad1Width) {
					game.ballDir.y *= -1;
			}
		}
	}
	else if (game.ballx + game.ballr >= game.pad2x && game.ballx - game.ballr <= game.pad2x + game.pad2Width) {
		if (game.bally - game.ballr <= game.pad2y + game.pad2Height && game.bally + game.ballr >= game.pad2y) {

			game.ballDir.x *= -1;

			if ((game.bally - game.ballr < game.pad2y + game.pad2Height && game.bally + game.ballr > game.pad2y + game.pad2Height ||
				game.bally + game.ballr > game.pad2y && game.bally - game.ballr < game.pad2y) &&
				game.ballx + game.ballr > game.pad2x) {
					game.ballDir.y *= -1;
			}

		}
	}
	return GameStatus.INPROGRESS;
}

function moveBall(game: GameI) {
	if (game.bally + game.ballr > game.canvasHeight || game.bally - game.ballr < 0)
		game.ballDir.y *= -1;

	game.ballx += game.ballDir.x * game.ballSpeed;
	game.bally += game.ballDir.y * game.ballSpeed;

}

function initGame(game: GameI, data: any) {
	game.canvasWidth = data.width / 2;
	game.canvasHeight = data.height / 2;

	game.ratiox = game.canvasWidth / gameWidth;
	game.ratioy = game.canvasHeight / gameHeight;

	game.pad1Width = padWidth * game.ratiox;
	game.pad1Height = padHeight * game.ratioy;
	game.pad1x = game.canvasWidth / 10 - padWidth;
	game.pad1y = game.canvasHeight / 2 - game.pad1Height / 2;
	game.pad1Speed = padSpeed * game.ratiox * game.ratioy;

	game.pad2Width = padWidth * game.ratiox;
	game.pad2Height = padHeight * game.ratioy;
	game.pad2x = game.canvasWidth - game.canvasWidth / 10;
	game.pad2y = game.canvasHeight / 2 - game.pad2Height / 2;
	game.pad2Speed = padSpeed * game.ratiox * game.ratioy;

	game.ballx = game.canvasWidth / 2;
	game.bally = game.canvasHeight / 2;
	game.ballr = ballRadius * game.ratiox * game.ratioy;
	game.ballSpeed = ballSpeed * game.ratiox * game.ratioy;
	game.ballDir = generate_random_start(null);

	game.score1 = 0;
	game.score2 = 0;

	game.status = GameStatus.WAITING;
}

function updateDimensions(game: GameI, data: any) {
	let previousW = game.canvasWidth;
	let previousH = game.canvasHeight;

	game.canvasWidth = data.width / 2;
	game.canvasHeight = data.height / 2;

	game.ratiox = game.canvasWidth / previousW;
	game.ratioy = game.canvasHeight / previousH;

	game.pad1x *= game.ratiox;
	game.pad1y *= game.ratioy;
	game.pad1Width *= game.ratiox;
	game.pad1Height *= game.ratioy;
	game.pad1Speed *= game.ratioy;

	game.pad2x *= game.ratiox;
	game.pad2y *= game.ratioy;
	game.pad2Width *= game.ratiox;
	game.pad2Height *= game.ratioy;
	game.pad2Speed *= game.ratioy;

	game.ballx *= game.ratiox;
	game.bally *= game.ratioy;
	game.ballr *= game.ratioy * game.ratiox;
	game.ballSpeed *= game.ratioy * game.ratiox;

}

@WebSocketGateway(42042, {
	cors: {
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

	@SubscribeMessage('startGame')
	startGame(client: Socket) {

		let moveInterval: NodeJS.Timer;

		moveInterval = setInterval(async () => {
			moveBall(this.game);

			this.game.status = checkCollision(this.game);

			//   if (ret == "n")
			// 	return ;
			//   else if (ret == "b") {
			// const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
			// for (const watcher of watchers) {
			//   this.server.to(watcher.socketId).emit('updateBall', { gameId: game.id, ball: game.ball, direction: game.direction});
			// }
			//   }
			//   if (ret == "s"){
			// 	const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
			// 	  for (const watcher of watchers) {
			// 		this.server.to(watcher.socketId).emit('updateScore', { gameId: game.id, score1: game.score1, score2: game.score2, ball: game.ball, direction: game.direction });
			// 	  }
			//   }
			//   else if (ret == "e") {
			// 	  this.closeGame(game);
			// 	  const watchers: JoinedGameI[] = await this.joinedGameService.findByGame(game.id);
			// 	  for (const watcher of watchers) {
			// 		this.server.to(watcher.socketId).emit('endGame', { gameId: game.id, status: game.status });
			// 	  }
			// 	  clearInterval(moveInterval);
			// 	  this.games.delete(game.id);
			// 	  this.server.emit('games', this.getGames())
			//   }
			//   else if (game.status != GameStatus.INPROGRESS) {

			// clearInterval(moveInterval);
			// 	this.games.delete(game.id);
			// 	this.server.emit('games', this.getGames())
			//   }

			if (this.game.status === GameStatus.INPROGRESS)
				this.server.emit("updateGame", this.game);
			else
				clearInterval(moveInterval);
		}, 34);
	}

	@SubscribeMessage('updateDimensions')
	updateDimensions(client: Socket, data: any) {
		updateDimensions(this.game, data);
		this.server.emit("updateGame", this.game);
	}

	@SubscribeMessage('stopGame')
	stopGame(client: Socket) {
	}

	@SubscribeMessage('arrowUp')
	padUp(client: Socket, data: GameI) {
		if (data.status === GameStatus.WAITING) {
			this.game.status = GameStatus.INPROGRESS;
			this.server.emit("startGame", this.game);
		}
		if (this.game.pad1y > this.game.pad1Speed)
			this.game.pad1y -= this.game.pad1Speed;
		else
			this.game.pad1y = 0;
		this.server.emit("updateGame", this.game);
	}

	@SubscribeMessage('arrowDown')
	padDown(client: Socket, data: GameI) {
		if (data.status === GameStatus.WAITING) {
			this.game.status = GameStatus.INPROGRESS;
			this.server.emit("startGame", this.game);
		}
		if (this.game.pad1y < this.game.canvasHeight - this.game.pad1Height - this.game.pad1Speed)
			this.game.pad1y += this.game.pad1Speed;
		else
			this.game.pad1y = this.game.canvasHeight - this.game.pad1Height;
		this.server.emit("updateGame", this.game);
	}



	// @SubscribeMessage('msgToServer')
	// handleMessage(client: Socket, message: string): void {
	// 	console.log(message);
	// 	this.server.emit('msgToClient', message);
	// }
}
