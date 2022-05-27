import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRoomService {

	rooms: string[] = [];

	addRoom(room_id: string) {
		this.rooms.push(room_id);
	}

	getRooms(): string[] {
		return this.rooms;
	}

	clear() {
		this.rooms = [];
	}
}