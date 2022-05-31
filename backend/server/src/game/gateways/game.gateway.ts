import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import BallI from "../interfaces/ballI.interface";
import GameI from "../interfaces/gameI.interface";
import PadI from "../interfaces/padI.interface";

export enum GameStatus {
	WAITING = "waiting",
	INCOMPLETE = "incomplete",
	INPROGRESS = "in progress",
	PLAYER1WON = "player 1 won",
	PLAYER2WON = "player 2 won",
	ENDED = "ended",
}

const gameWidth = 640;
const gameHeight = 480;
const padWidth = 10;
const padHeight = 100;
// const padHeight = 480;
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

function resetAfterPoint(game: GameI, side: string) {
	game.pad1.x = game.canvasWidth / 10 - padWidth;
	game.pad1.y = game.canvasHeight / 2 - game.pad1.height / 2;
	game.pad2.x = game.canvasWidth - game.canvasWidth / 10;
	game.pad2.y = game.canvasHeight / 2 - game.pad2.height / 2;
	game.ball.x = game.canvasWidth / 2;
	game.ball.y = game.canvasHeight / 2;
	game.ball.dir = generate_random_start(side);
	return GameStatus.WAITING;
}

function checkCollision(game: GameI) {
	if (game.ball.x - game.ball.r <= 0) {
		game.score2++;
		if (game.score2 === pointToWin)
			return GameStatus.PLAYER2WON;
		return resetAfterPoint(game, "left");
	}
	else if (game.ball.x + game.ball.r >= game.canvasWidth) {
		game.score1++;
		if (game.score1 === pointToWin)
			return GameStatus.PLAYER1WON;
		return resetAfterPoint(game, "right");
	}
	else if (game.ball.x - game.ball.r <= game.pad1.x + game.pad1.width && game.ball.x + game.ball.r >= game.pad1.x) {
		if (game.ball.y - game.ball.r <= game.pad1.y + game.pad1.height && game.ball.y + game.ball.r >= game.pad1.y) {

			game.ball.dir.x *= -1;

			if ((game.ball.y - game.ball.r < game.pad1.y + game.pad1.height && game.ball.y + game.ball.r > game.pad1.y + game.pad1.height ||
				game.ball.y + game.ball.r > game.pad1.y && game.ball.y - game.ball.r < game.pad1.y) &&
				game.ball.x - game.ball.r < game.pad1.x + game.pad1.width) {
					game.ball.dir.y *= -1;
			}
		}
	}
	else if (game.ball.x + game.ball.r >= game.pad2.x && game.ball.x - game.ball.r <= game.pad2.x + game.pad2.width) {
		if (game.ball.y - game.ball.r <= game.pad2.y + game.pad2.height && game.ball.y + game.ball.r >= game.pad2.y) {

			game.ball.dir.x *= -1;

			if ((game.ball.y - game.ball.r < game.pad2.y + game.pad2.height && game.ball.y + game.ball.r > game.pad2.y + game.pad2.height ||
				game.ball.y + game.ball.r > game.pad2.y && game.ball.y - game.ball.r < game.pad2.y) &&
				game.ball.x + game.ball.r > game.pad2.x) {
					game.ball.dir.y *= -1;
			}
		}
	}
	return GameStatus.INPROGRESS;
}

function moveBall(game: GameI) {
	if (game.ball.y + game.ball.r > game.canvasHeight || game.ball.y - game.ball.r < 0)
		game.ball.dir.y *= -1;

	game.ball.x += game.ball.dir.x * game.ball.speed;
	game.ball.y += game.ball.dir.y * game.ball.speed;
}

function initGame(game: GameI, data: any) {
	game.canvasWidth = data.width / 2;
	game.canvasHeight = data.height / 2;

	let ratiox = game.canvasWidth / gameWidth;
	let ratioy = game.canvasHeight / gameHeight;

	game.pad1.width = padWidth * ratiox;
	game.pad1.height = padHeight * ratioy;
	game.pad1.x = game.canvasWidth / 10 - padWidth;
	game.pad1.y = game.canvasHeight / 2 - game.pad1.height / 2;
	game.pad1.speed = padSpeed * ratiox * ratioy;

	game.pad2.width = padWidth * ratiox;
	game.pad2.height = padHeight * ratioy;
	game.pad2.x = game.canvasWidth - game.canvasWidth / 10;
	game.pad2.y = game.canvasHeight / 2 - game.pad2.height / 2;
	game.pad2.speed = padSpeed * ratiox * ratioy;

	game.ball.x = game.canvasWidth / 2;
	game.ball.y = game.canvasHeight / 2;
	game.ball.r = ballRadius * ratiox * ratioy;
	game.ball.speed = ballSpeed * ratiox * ratioy;
	game.ball.dir = generate_random_start(null);

	game.score1 = 0;
	game.score2 = 0;

	game.status = GameStatus.WAITING;
}

function updateDimensions(game: GameI, data: any) {
	let previousW = game.canvasWidth;
	let previousH = game.canvasHeight;

	game.canvasWidth = data.width / 2;
	game.canvasHeight = data.height / 2;

	let ratiox = game.canvasWidth / previousW;
	let ratioy = game.canvasHeight / previousH;

	game.pad1.x *= ratiox;
	game.pad1.y *= ratioy;
	game.pad1.width *= ratiox;
	game.pad1.height *= ratioy;
	game.pad1.speed *= ratioy;

	game.pad2.x *= ratiox;
	game.pad2.y *= ratioy;
	game.pad2.width *= ratiox;
	game.pad2.height *= ratioy;
	game.pad2.speed *= ratioy;

	game.ball.x *= ratiox;
	game.ball.y *= ratioy;
	game.ball.r *= ratioy * ratiox;
	game.ball.speed *= ratioy * ratiox;
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
		this.game.pad1 = {} as PadI;
		this.game.pad2 = {} as PadI;
		this.game.ball = {} as BallI;
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client connected id:			${client.id}`);
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

			if (this.game.status != GameStatus.ENDED)
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

			if (this.game.status != GameStatus.INPROGRESS)
				clearInterval(moveInterval);
			this.server.emit("updateGame", this.game);
		}, 1000 / 30);
	}

	@SubscribeMessage('updateDimensions')
	updateDimensions(client: Socket, data: any) {
		updateDimensions(this.game, data);
		this.server.emit("updateGame", this.game);
	}

	@SubscribeMessage('stopGame')
	stopGame(client: Socket) {
		this.game.status = GameStatus.ENDED;
	}

	@SubscribeMessage('arrowUp')
	padUp(client: Socket, data: GameI) {
		if (data.status === GameStatus.WAITING) {
			this.game.status = GameStatus.INPROGRESS;
			this.startGame(client);
		}
		if (this.game.pad1.y > this.game.pad1.speed)
			this.game.pad1.y -= this.game.pad1.speed;
		else
			this.game.pad1.y = 0;
		this.server.emit("updateGame", this.game);
	}

	@SubscribeMessage('arrowDown')
	padDown(client: Socket, data: GameI) {
		if (data.status === GameStatus.WAITING) {
			this.game.status = GameStatus.INPROGRESS;
			this.startGame(client);
		}
		if (this.game.pad1.y < this.game.canvasHeight - this.game.pad1.height - this.game.pad1.speed)
			this.game.pad1.y += this.game.pad1.speed;
		else
			this.game.pad1.y = this.game.canvasHeight - this.game.pad1.height;
		this.server.emit("updateGame", this.game);
	}
}
