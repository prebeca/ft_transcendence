import {
	Body,
	Controller,
	Get,
	Req,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	ParseArrayPipe,
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
import { createReadStream, ReadStream } from 'fs';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) { }

	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req: Request) {
		console.log(req.user);
		return this.userService.findUsersById(req.user["userid"]);
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/update/username')
	updateProfile(@Req() req: Request) {
		return this.userService.updateUsername(req.user["userid"], req.body["new_username"]);
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
		var file: ReadStream;

		if (filename === undefined) {
			file = createReadStream('src/avatar/default.png');
		}
		else {
			file = createReadStream('src/avatar/' + filename);
		}
		res.set({
			'Content-Type': 'image/png',
			'Content-Disposition': 'attachment; filename=' + filename,
		});
		return new StreamableFile(file);
	}

	@Get('id/:id')
	findUsersById(@Param('id') id: number) {
		console.log(id);
		return this.userService.findUsersById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() userDto: UserDto) {
		return this.userService.createUser(userDto);
	}

	@Get('delete/:id')
	deleteUsersById(@Param('id', ParseIntPipe) id: number) {
		return this.userService.remove(id);
	}

	@Get('deleteall')
	deleteUsers() {
		return this.userService.removeAll();
	}

	@Post('addGroup')
	addGroup(@Body(new ParseArrayPipe({ items: UserDto })) createUserDtos: UserDto[]) {
		for (const val of createUserDtos)
			this.userService.createUser(val);
		return this.userService.getUsers();
	}
}
