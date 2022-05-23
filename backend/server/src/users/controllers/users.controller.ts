import {
	Body,
	Controller,
	Get,
	Req,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
	UploadedFile,
	UseInterceptors,
	StreamableFile,
	Response
} from '@nestjs/common';
import { UserDto } from '../dto/users.dto';
import { UsersService } from 'src/users/services/users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { multerOptions } from 'src/common/UploadOptions';
import { User } from '../entities/user.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { Channel } from 'src/typeorm';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService, private readonly channelService: ChannelsService) { }

	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: Request) {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return user; // does not need to do it actually, jwtStrategy already returns the user
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/update/username')
	updateUsername(@Req() req: Request) {
		const user: User = { ... (req.user as User) };
		if (!user)
			return null;
		return this.userService.updateUsername(user, req.body["new_username"]);
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/update/avatar')
	@UseInterceptors(FileInterceptor('file', multerOptions))
	async updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<User> {
		console.log("update avatar");
		return await this.userService.updateAvatar(file.filename, req.user["userid"]);
	}

	@Get('profile/avatar/:filename')
	async getAvatar(@Response({ passthrough: true }) res, @Param('filename') filename: string): Promise<StreamableFile> {
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
	async getChannels(@Req() req: Request) {
		const channels: number[] = (await this.userService.findUsersById(req.user["userid"])).channels;
		return await this.channelService.getChannelsById(channels);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() userDto: UserDto) {
		return this.userService.createUser(userDto);
	}

	@Get('deleteall')
	deleteUsers() {
		return this.userService.removeAll();
	}
}
