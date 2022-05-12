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
	ParseArrayPipe
} from '@nestjs/common';
import { UserDto} from '../dto/users.dto';
import { UsersService } from 'src/users/services/users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

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
		return this.userService.findUsersById(req.user[0]);
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/update')
	updateProfile(@Req() req: Request) {
		return this.userService.updateUsername(req.user["userid"], req.body["new_username"]);
	}


	@Get('id?:id')
	findUsersById(@Param('id') id: string) {
		console.log(id);
		//return this.userService.findUsersById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() userDto: UserDto) {
		return this.userService.createUser(userDto);
	}
	
	@Get('nfo')
	getUserInfo(): string {
		const hello: string = "allo";
		return hello;
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
	addGroup(@Body(new ParseArrayPipe({items: UserDto}))
		createUserDtos: UserDto[],
	) {
		for (const val of createUserDtos)
			this.userService.createUser(val);
		return this.userService.getUsers();
	}
}
