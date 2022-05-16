import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserDto } from './dto/users.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { MulterModule } from '@nestjs/platform-express';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		MulterModule.register({
			dest: './avatar',
		})
		],
	controllers: [UsersController],
	providers: [UsersService, UserDto],
	exports: [UsersService, UserDto]
})
export class UsersModule { }
