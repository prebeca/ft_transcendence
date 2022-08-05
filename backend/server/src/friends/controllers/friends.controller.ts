import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtTwoFactorAuthGuard } from '../../auth/guards/jwt-twofa.guard';
import { User } from '../../users/entities/user.entity';
import { FriendsService } from '../services/friends.service';

@Controller('friends')
export class FriendsController {
	constructor(
		private readonly friendsService: FriendsService,
	) { }

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get()
	getFriends(@Req() req: Request): User[] {
		const user: User = { ... (req.user as User) };
		return this.friendsService.getFriends(user);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('add')
	async addFriend(@Req() req: Request): Promise<void> {
		return await this.friendsService.addFriend(req.user as User, req.body.user_id_to_add);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('remove')
	async removeFriend(@Req() req: Request): Promise<void> {
		return await this.friendsService.removeFriend(req.user as User, req.body.user_id_to_remove);
	}
}
