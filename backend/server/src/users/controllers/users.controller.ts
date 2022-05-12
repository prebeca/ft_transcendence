import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	ParseArrayPipe,
	Headers
} from '@nestjs/common';
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
	addGroup(@Body(new ParseArrayPipe({items: CreateUserDto}))
		createUserDtos: CreateUserDto[],
	) {
		for (const val of createUserDtos)
			this.userService.createUser(val);
		return this.userService.getUsers();
	}
}
