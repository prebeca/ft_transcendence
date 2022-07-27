import {
	Controller, Get, Req, Param, Post, UploadedFile, UseInterceptors, StreamableFile, Res
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { multerOptions } from 'src/common/UploadOptions';
import { User } from '../entities/user.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { Channel } from 'src/typeorm';
import { JwtTwoFactorAuthGuard } from 'src/auth/guards/jwt-twofa.guard';

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
		return (await this.userService.findUsersById(req.user["id"])).channels;
	}

	@Get('deleteall')
	async deleteUsers(): Promise<User[]> {
		return await this.userService.removeAll();
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
