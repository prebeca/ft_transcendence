import {
	Body, Controller, Get, Req, Param, Post, UsePipes, ValidationPipe,
	UploadedFile, UseInterceptors, StreamableFile, Res
} from '@nestjs/common';
import { UserDto } from '../dto/users.dto';
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

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: Request): User {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return user;
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/update/username')
	async updateUsername(@Req() req: Request): Promise<void> {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return await this.userService.updateUsername(user, req.body["new_username"]);
	}

	@UseGuards(JwtAuthGuard)
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
		const channels: number[] = (await this.userService.findUsersById(req.user["id"])).channels;
		return await this.channelService.getChannelsById(channels);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() userDto: UserDto): User {
		return this.userService.createUser(userDto);
	}

	@Get('deleteall')
	async deleteUsers(): Promise<User[]> {
		return await this.userService.removeAll();
	}
}
