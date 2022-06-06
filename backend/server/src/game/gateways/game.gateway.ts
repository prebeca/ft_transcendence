import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { time, timeLog } from "console";
import { Server, Socket } from "socket.io";
import { Game } from "../entities/game.entity";
import BallI from "../interfaces/ballI.interface";
import GameI from "../interfaces/gameI.interface";
import PadI from "../interfaces/padI.interface";
import { GameRoomService } from "../services/gameroom.service";

export enum GameStatus {
	WAITING = "waiting",
	INCOMPLETE = "incomplete",
	INPROGRESS = "in progress",
	PLAYER1WON = "player 1 won",
	PLAYER2WON = "player 2 won",
	PLAYER1LEAVE = "player 2 won by forfeit",
	PLAYER2LEAVE = "player 1 won by forfeit",
	ENDED = "ended",
}

const gameWidth = 640;
const gameHeight = 480;
const padWidth = 10;
const padHeight = 100;
const ballRadius = 7;
const ballSpeed = 1;
const padSpeed = 20;
const pointToWin = 10;
let looserPoint = "";

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
	game.pad1.x = game.gameWidth / 10 - padWidth;
	game.pad1.y = game.gameHeight / 2 - game.pad1.height / 2;
	game.pad2.x = game.gameWidth - game.gameWidth / 10;
	game.pad2.y = game.gameHeight / 2 - game.pad2.height / 2;
	game.ball.x = game.gameWidth / 2;
	game.ball.y = game.gameHeight / 2;
	game.ball.dir = generate_random_start(side);
	return GameStatus.WAITING;
}

function checkCollision(game: GameI) {
	if (game.ball.x - game.ball.r <= 0) {
		game.score2++;
		if (game.score2 === pointToWin)
			return GameStatus.PLAYER2WON;
		looserPoint = game.pad1.id;
		return resetAfterPoint(game, "left");
	}
	else if (game.ball.x + game.ball.r >= game.gameWidth) {
		game.score1++;
		if (game.score1 === pointToWin)
			return GameStatus.PLAYER1WON;
		looserPoint = game.pad2.id;
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
	if (game.ball.y + game.ball.r + game.ball.speed > game.gameHeight) {
		game.ball.y = game.gameHeight - game.ball.r;
		game.ball.dir.y *= -1;
	}
	if (game.ball.y - game.ball.r < game.ball.speed) {
		game.ball.y = game.ball.r;
		game.ball.dir.y *= -1;
	}
	game.ball.x += game.ball.dir.x * game.ball.speed;
	game.ball.y += game.ball.dir.y * game.ball.speed;
}

function initGame(game: GameI,) {
	game.gameWidth = gameWidth;
	game.gameHeight = gameHeight;

	game.pad1.width = padWidth;
	game.pad1.height = padHeight;
	game.pad1.x = game.gameWidth / 10 - padWidth;
	game.pad1.y = game.gameHeight / 2 - game.pad1.height / 2;
	game.pad1.speed = padSpeed;

	game.pad2.width = padWidth;
	game.pad2.height = padHeight;
	game.pad2.x = game.gameWidth - game.gameWidth / 10;
	game.pad2.y = game.gameHeight / 2 - game.pad2.height / 2;
	game.pad2.speed = padSpeed;

	game.ball.x = game.gameWidth / 2;
	game.ball.y = game.gameHeight / 2;
	game.ball.r = ballRadius;
	game.ball.speed = ballSpeed;
	game.ball.dir = generate_random_start(null);

	game.score1 = 0;
	game.score2 = 0;

	game.status = GameStatus.WAITING;
	looserPoint = game.pad1.id;
}

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private gameRoomService: GameRoomService,
	) { }

	/*
	** Testing it like this because if it is the same server we are using, they will be both initialized together
	** it means One method for both gateways
	*/
	/*public game: GameI = {
		gameWidth: 0,
		gameHeight: 0,
		pad1: {} as PadI,
		pad2: {} as PadI,
		ball: {} as BallI,
		score1: 0,
		score2: 0,
		status: ""
	};*/
	game = {} as GameI;

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger("gameGateway");

	afterInit(server: Server) {
		this.gameRoomService.clear();
		this.logger.log("game socket init !");
		this.game.pad1 = {} as PadI;
		this.game.pad2 = {} as PadI;
		this.game.ball = {} as BallI;
	}

	handleDisconnect(client: Socket) {
		console.log(`Client ${client.id} disconnected from game`);
		this.leaveGame(client);
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client ${client.id} connected to game gateway`);
	}

	@SubscribeMessage('joinGame')
	joinGame(client: Socket) {
		console.log(`Client ${client.id} joined the game`);

		if (!this.game.pad1.id) {
			this.game.pad1.id = client.id;
			initGame(this.game);
		}
		else if (!this.game.pad2.id)
			this.game.pad2.id = client.id;
		client.emit("initDone", this.game);
	}

	@SubscribeMessage('startGame')
	startGame(client: Socket) {
		this.game.status = GameStatus.INPROGRESS;

		let moveInterval: NodeJS.Timer;

		moveInterval = setInterval(async () => {
			moveBall(this.game);

			if (this.game.status === GameStatus.INPROGRESS)
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
			// if (this.game.status === GameStatus.PLAYER1WON || this.game.status === GameStatus.PLAYER2WON)
			// 	this.server.emit("end", this.game);
			// else
			this.server.emit("updateGame", this.game);
		}, 1000 / 30);
	}

	@SubscribeMessage('leaveGame')
	leaveGame(client: Socket) {
		if (this.game.pad1.id === client.id) {
			this.game.status = GameStatus.PLAYER1LEAVE;
			this.server.emit('updateStatus', this.game.status);
		}
		if (this.game.pad2.id === client.id) {
			this.game.status = GameStatus.PLAYER2LEAVE;
			this.server.emit('updateStatus', this.game.status);
		}
		client.disconnect(true);
	}

	@SubscribeMessage('arrowUp')
	padUp(client: Socket, data: GameI) {
		if (!this.game.pad1.id || !this.game.pad2.id)
			return;
		let pad: PadI;
		if (this.game.pad1.id === client.id)
			pad = this.game.pad1;
		if (this.game.pad2.id === client.id)
			pad = this.game.pad2;
		if (pad) {
			if (data.status === GameStatus.WAITING && looserPoint === pad.id) {
				this.startGame(client);
			}
			if (this.game.status === GameStatus.INPROGRESS) {
				if (pad.y > pad.speed)
					pad.y -= pad.speed;
				else
					pad.y = 0;
				this.server.emit("updateGame", this.game);
			}
		}
	}

	@SubscribeMessage('arrowDown')
	padDown(client: Socket, data: GameI) {
		if (!this.game.pad1.id || !this.game.pad2.id)
			return;
		let pad: PadI;
		if (this.game.pad1.id === client.id)
			pad = this.game.pad1;
		if (this.game.pad2.id === client.id)
			pad = this.game.pad2;
		if (pad) {
			if (data.status === GameStatus.WAITING && looserPoint === pad.id) {
				this.startGame(client);
			}
			if (this.game.status === GameStatus.INPROGRESS) {
				if (pad.y < this.game.gameHeight - pad.height - pad.speed)
					pad.y += pad.speed;
				else
					pad.y = this.game.gameHeight - pad.height;
				this.server.emit("updateGame", this.game);
			}
		}
	}
}
