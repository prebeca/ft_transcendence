import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { FriendsService } from '../services/friends.service';
import { Request } from 'express';

@Controller('friends')
export class FriendsController {
	constructor(
		private readonly friendsService: FriendsService,
	) { }

	/*
	** Listing
	*/
	@UseGuards(JwtAuthGuard)
	@Get()
	async getFriends(@Req() req: Request): Promise<User[]> {
		const user: User = { ... (req.user as User) };
		return await this.friendsService.getFriends(user);
	}

	@UseGuards(JwtAuthGuard)
	@Post('add')
	async addFriend(@Req() req: Request) {
		return await this.friendsService.addFriend(req.user as User, req["user_id_to_add"]);
	}

	@UseGuards(JwtAuthGuard)
	@Post('remove')
	async removeFriend(@Req() req: Request) {
		return await this.friendsService.removeFriend(req.user as User, req["user_id_to_remove"]);
	}
	/*
	** ADD - REMOVE
	*/
}
