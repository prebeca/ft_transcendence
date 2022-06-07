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
	getFriends(@Req() req: Request): User[] {
		const user: User = { ... (req.user as User) };
		return this.friendsService.getFriends(user);
	}

	@UseGuards(JwtAuthGuard)
	@Post('add')
	async addFriend(@Req() req: Request) {
		console.log(req.body);
		return await this.friendsService.addFriend(req.user as User, req.body.user_id_to_add);
	}

	@UseGuards(JwtAuthGuard)
	@Post('remove')
	async removeFriend(@Req() req: Request) {
		console.log(req.body);
		return await this.friendsService.removeFriend(req.user as User, req.body.user_id_to_remove);
	}
	/*
	** ADD - REMOVE
	*/
}
