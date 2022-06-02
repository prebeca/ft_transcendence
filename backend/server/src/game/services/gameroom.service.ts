import { Injectable } from '@nestjs/common';
import { GameRoomClass } from '../classes/gameroom.class';
import { CreateGameDto } from '../dto/create-game.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameRoomService {

	public rooms: string[] = []; // keeps track of every rooms created
	private readonly ppr: number = 2; // maximum player per room/game
	public gameRooms: Map<string, GameRoomClass> = new Map<string, GameRoomClass>(); // contains every information (every room with their uid as key and every player in every rooms)

	generate_name(): string {
		var name: string = uuid();
		return (name);
	}

	addRoom(createGameDto: CreateGameDto): string {
		const roomname: string = this.generate_name();
		this.rooms.push(roomname);
		let newGameRoom: GameRoomClass = new GameRoomClass();
		newGameRoom.setOptions(roomname, createGameDto);
		this.gameRooms.set(roomname, newGameRoom);
		return roomname;
	}

	getRooms(): string[] {
		return this.rooms;
	}

	getRoomById(id_room: string): GameRoomClass {
		return this.gameRooms.get(id_room);
	}

	containsRoom(room_id: string): boolean {
		if (this.rooms.indexOf(room_id) === -1)
			return false;
		return true;
	}

	clear() {
		this.rooms = [];
		this.gameRooms.clear();
	}

	getPPG(): number {
		return this.ppr;
	}
}

