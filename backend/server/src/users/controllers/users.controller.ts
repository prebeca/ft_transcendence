import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	Req,
	ParseArrayPipe
} from '@nestjs/common';
import { equal } from 'assert';
import { CreateUserDto} from '../dto/users.dto';
import { UsersService } from 'src/users/services/users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) { }

	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

	@Get('id?:id')
	findUsersById(@Param('id') id: string) {
		console.log(id);
		//return this.userService.findUsersById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
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
	addGroup(@Body(new ParseArrayPipe({items: CreateUserDto}))
		createUserDtos: CreateUserDto[],
	) {
		for (const val of createUserDtos)
			this.userService.createUser(val);
		return this.userService.getUsers();
	}
}
