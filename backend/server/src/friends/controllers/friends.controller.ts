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
	@Get()
	async getFriends(@Req() req: Request): Promise<User[]> {
		const user: User = { ... (req.user as User) };
		return await this.friendsService.getFriends(user);
	}

	@Post('add')
	async addFriend(@Req() req: Request) {
		return await this.friendsService.addFriend();
	}

	@Post('remove')
	async removeFriend(@Req() req: Request) {
		return await this.friendsService.removeFriend();
	}
	/*
	** ADD - REMOVE
	*/
}
