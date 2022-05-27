import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRoomService {

	findAll() {
		return `This action returns all game`;
	}

	findOne(id: number) {
		return `This action returns a #${id} game`;
	}

	remove(id: number) {
		return `This action removes a #${id} game`;
	}
}