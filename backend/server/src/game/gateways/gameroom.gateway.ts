import { ContextType, Inject, Logger, Req, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { WsJwtAuthGuard } from "src/auth/guards/ws-jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { GameRoomClass } from "../classes/gameroom.class";
import { PlayerClass } from "../classes/player.class";
import { Player } from "../entities/player.entity";

@WebSocketGateway(42041, {
	cors: {
		origin: process.env.APPLICATION_REDIRECT_URI,
		credentials: true
	}
})
export class GameRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	) { }

	@WebSocketServer()
	server2 = new Server();

	private readonly ppr: number = 2;
	private id_room: number = 1;
	private rooms: string[] = [];
	private logger: Logger = new Logger("gameRoomGateway");

	private gameRooms: Map<string, GameRoomClass> = new Map<string, GameRoomClass>();

	afterInit(server2: Server) {
		this.logger.log("gameroom socket init !");
		this.gameRooms.clear();
		this.server2.emit("disco");
		this.server2.sockets.disconnectSockets();
		this.server2.disconnectSockets();
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		//this.gameRoom.deletePlayer(client.id);
	}

	handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		console.log(`Client connected:    ${client.id}`);
		//this.gameRoom.addPlayerToRoom(client.id);
	}

	createRoom(roomname: string, sid: string, user: User, player: Player) {
		console.log("creation of room named: " + roomname);
		this.rooms.push(roomname);
		let gameRoom: GameRoomClass = new GameRoomClass();
		gameRoom.roomname = roomname;
		this.gameRooms.set(roomname, gameRoom);
		gameRoom.addPlayerToRoom(sid, user);
		this.server2.emit("infouserp1", { username: user.username, avatar: user.avatar, level: player.level, losses: player.losses, wins: player.winnings, mmr: player.mmr });
	}

	@UseGuards(WsJwtAuthGuard)
	@SubscribeMessage('joinRoom')
	joinRoom(@Req() req, @MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const user: User = { ... (req.user as User) };
		const player: Player = user.player;
		console.log(player);
		if (this.rooms.indexOf(data) === -1) {
			return this.createRoom(data, client.id, user, player);
		} else {
			let gameRoom: GameRoomClass = this.gameRooms.get(data);
			if (gameRoom.nbPlayer < this.ppr) //add user to room (spectator or otherwise) but not to the gameroom object if spectator
				gameRoom.addPlayerToRoom(client.id, user);
			for (const [key, value] of gameRoom.mapPlayers) { //will send to every member the informations of every player present
				this.server2.emit("infouserp" + value.player_number, {
					username: value.username,
					avatar: value.avatar,
					level: value.level,
					losses: value.losses,
					wins: value.wins,
					mmr: value.mmr,
				});
				console.log(`${key} = ${value}`);
			}
		}
		client.join(data); //Should use interfaces for it instead of this json (same but not clear)
	}
}
