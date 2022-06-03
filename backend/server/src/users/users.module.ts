import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserDto } from './dto/users.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { Player } from 'src/game/entities/player.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Player]),
		MulterModule.register({
			dest: './avatar',
		}),
		ChannelsModule
	],
	controllers: [UsersController],
	providers: [UsersService, UserDto],
	exports: [UsersService, UserDto]
})
export class UsersModule { }
