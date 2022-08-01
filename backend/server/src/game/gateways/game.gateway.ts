import { Inject, Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AvatarStatusGateway } from "src/users/gateways/avatarstatus.gateway";
import { GameRoomClass } from "../classes/gameroom.class";
import { PlayerClass } from "../classes/player.class";
import GameI from "../interfaces/gameI.interface";
import PadI from "../interfaces/padI.interface";
import { PlayerInfo } from "../interfaces/playerinfo.interface";
import { GameService } from "../services/game.service";
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
const pointToWin = 2;

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
		if (game.score2 === pointToWin) {
			return GameStatus.PLAYER2WON;
		}
		game.looserPoint = game.pad1.id;
		return resetAfterPoint(game, "left");
	}
	else if (game.ball.x + game.ball.r >= game.gameWidth) {
		game.score1++;
		if (game.score1 === pointToWin) {

			return GameStatus.PLAYER1WON;
		}
		game.looserPoint = game.pad2.id;
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

function initGame(game: GameI) {
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
	game.looserPoint = game.pad1.id;
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
		private gameService: GameService
	) { }

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger("gameGateway");

	@Inject(AvatarStatusGateway)
	private gatewayStatus: AvatarStatusGateway;

	afterInit(server: Server) {
		this.gameRoomService.clear();
		this.logger.log("game socket init !");
	}

	handleDisconnect(client: Socket) {
		console.log(`Client ${client.id} disconnected from game`);
		this.leaveGame(client, this.gameRoomService.getRoomNameByPlayerId(client.id));
	}

	@SubscribeMessage('leaveGame')
	leaveGame(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
		console.log("leave = " + id);
		if (id === null)
			return;
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(id);
		if (!gameRoom || gameRoom.finished)
			return;
		let game: GameI = gameRoom.getGame();
		if (game.pad1.id === client.id) {
			var pc: PlayerClass = gameRoom.getPlayerById(client.id);
			this.gatewayStatus.backToConnected(pc.userid);
			game.status = GameStatus.PLAYER1LEAVE;
			this.server.to(id).emit('updateStatus', game.status);
		}
		if (game.pad2.id === client.id) {
			var pc: PlayerClass = gameRoom.getPlayerById(client.id);
			this.gatewayStatus.backToConnected(pc.userid);
			game.status = GameStatus.PLAYER2LEAVE;
			this.server.to(id).emit('updateStatus', game.status);
		}
		if (game.status === GameStatus.PLAYER1LEAVE || game.status === GameStatus.PLAYER2LEAVE) {
			this.gameService.gameFinished(gameRoom, game, id);
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log(`Client ${client.id} connected to game gateway`);
	}

	@SubscribeMessage('joinGame')
	joinGame(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
		console.log(`Client ${client.id} joined the game`);

		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(id);
		let game: GameI = gameRoom.getGame();

		if (!game.pad1.id || !game.pad2.id) {
			var playerinfo: PlayerInfo = gameRoom.getPlayerInfoById(client.id);
			if (playerinfo.player_number === 1) {
				game.pad1.id = client.id;
				initGame(game);
			}
			else if (playerinfo.player_number === 2)
				game.pad2.id = client.id;
			this.gatewayStatus.inGame(playerinfo.userid);
		}
		client.emit("initDone", game);
	}

	startGame(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
		let gameRoom: GameRoomClass = this.gameRoomService.getRoomById(id);
		let game: GameI = gameRoom.getGame();
		let moveInterval: NodeJS.Timer;

		game.status = GameStatus.INPROGRESS;
		moveInterval = setInterval(async () => {
			moveBall(game);
			if (game.status === GameStatus.INPROGRESS)
				game.status = checkCollision(game);
			if (game.status != GameStatus.INPROGRESS)
				clearInterval(moveInterval);
			if (game.status === GameStatus.PLAYER2WON || game.status === GameStatus.PLAYER1WON) { //rentre deux fois dans le DB les scores
				this.gameService.gameFinished(gameRoom, game, id);
			}
			this.server.to(id).emit("updateGame", game);
		}, 1000 / 30);
	}

	@SubscribeMessage('arrowUp')
	padUp(@ConnectedSocket() client: Socket, @MessageBody('data') data: GameI, @MessageBody('id') id: string) {
		let game: GameI = this.gameRoomService.getRoomById(id).getGame();
		if (!game.pad1.id || !game.pad2.id)
			return;
		let pad: PadI;
		if (game.pad1.id === client.id)
			pad = game.pad1;
		if (game.pad2.id === client.id)
			pad = game.pad2;
		if (pad) {
			if (data.status === GameStatus.WAITING && game.looserPoint === pad.id) {
				this.startGame(client, id);
			}
			if (game.status === GameStatus.INPROGRESS) {
				if (pad.y > pad.speed)
					pad.y -= pad.speed;
				else
					pad.y = 0;
				this.server.to(id).emit("updateGame", game);
			}
		}
	}

	@SubscribeMessage('arrowDown')
	padDown(@ConnectedSocket() client: Socket, @MessageBody('data') data: GameI, @MessageBody('id') id: string) {
		let game: GameI = this.gameRoomService.getRoomById(id).getGame();
		if (!game.pad1.id || !game.pad2.id)
			return;
		let pad: PadI;
		if (game.pad1.id === client.id)
			pad = game.pad1;
		if (game.pad2.id === client.id)
			pad = game.pad2;
		if (pad) {
			if (data.status === GameStatus.WAITING && game.looserPoint === pad.id) {
				this.startGame(client, id);
			}
			if (game.status === GameStatus.INPROGRESS) {
				if (pad.y < game.gameHeight - pad.height - pad.speed)
					pad.y += pad.speed;
				else
					pad.y = game.gameHeight - pad.height;
				this.server.to(id).emit("updateGame", game);
			}
		}
	}
}
