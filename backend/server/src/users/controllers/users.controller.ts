import {
	Controller, Get, Param, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtTwoFactorAuthGuard } from 'src/auth/guards/jwt-twofa.guard';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { multerOptions } from 'src/common/UploadOptions';
import { Channel } from 'src/typeorm';
import { UsersService } from 'src/users/services/users.service';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
	constructor(
		private readonly userService: UsersService,
		private readonly channelService: ChannelsService,
	) { }

	@Get()
	async getUsers(): Promise<User[]> {
		return await this.userService.getUsers();
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('profile')
	async getProfile(@Req() req: Request): Promise<User> {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		const is2fa: boolean = (await this.userService.findUserbyIdWithSensibleData(user.id)).twofauser;
		return { ...user, twofauser: is2fa };
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('profile/update/userinfos')
	async updateUserinfo(@Req() req: Request): Promise<boolean> {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		await this.userService.updateUserinfo(user, req.body["new_username"]);
		if (req.body["istwofa"] === false)
			await this.userService.updateTwoFAUser(user, false);
		if (req.body["istwofa"] === true) {
			return true;
		}
		return false;
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('profile/update/username')
	async updateUsername(@Req() req: Request): Promise<void> {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return await this.userService.updateUsername(user, req.body["new_username"]);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Post('profile/update/avatar')
	@UseInterceptors(FileInterceptor('file', multerOptions))
	async updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<User> {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return await this.userService.updateAvatar(user, file.filename);
	}

	@Get('profile/avatar/:filename')
	async getAvatar(@Res({ passthrough: true }) res: Response, @Param('filename') filename: string): Promise<StreamableFile> {
		const file: StreamableFile = await this.userService.getAvatar(filename);
		if (file) {
			res.set({
				'Content-Type': 'image/png',
				'Content-Disposition': 'attachment; filename=' + filename,
			});
			return file;
		}
		return null;
	}

	@UseGuards(JwtAuthGuard)
	@Get('channels')
	async getChannels(@Req() req: Request): Promise<Channel[]> {
		return (await this.userService.findUsersByIdWithChannels(req.user["id"])).channels;
	}

	@UseGuards(JwtAuthGuard)
	@Get('friends')
	async getFriends(@Req() req: Request): Promise<User[]> {
		return (await this.userService.findUsersById(req.user["id"])).friends;
	}

	@Get('deleteall')
	async deleteUsers(): Promise<User[]> {
		return await this.userService.removeAll();
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('/u/:username')
	async getProfileById(@Param('username') username: string): Promise<User> {
		const user: User = (await this.userService.findOneByUsername(username));
		if (!user)
			return null;
		const user_to_return: User = (await this.userService.findUsersByIdWithRelations(user.id));
		return user_to_return;
	}

	@UseGuards(JwtAuthGuard)
	@Post('block/:id')
	async addToBlocked(@Req() req: Request, @Param('id') id: number) {
		return this.userService.addToBlocked(req.user as User, id);
	}

	@UseGuards(JwtAuthGuard)
	@Post('unblock/:id')
	async removeFromBlocked(@Req() req: Request, @Param('id') id: number) {
		return this.userService.removeFromBlocked(req.user as User, id);
	}
}
