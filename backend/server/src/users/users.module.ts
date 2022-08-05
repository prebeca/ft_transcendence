import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsModule } from '../chat/channels/channels.module';
import { FriendsController } from '../friends/controllers/friends.controller';
import { FriendsModule } from '../friends/friends.module';
import { FriendsService } from '../friends/services/friends.service';
import { Player } from '../game/entities/player.entity';
import { User } from '../typeorm';
import { UsersController } from './controllers/users.controller';
import { UserDto } from './dto/users.dto';
import { AvatarStatusGateway } from './gateways/avatarstatus.gateway';
import { UsersService } from './services/users.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Player]),
		MulterModule.register({
			dest: './avatar',
		}),
		ChannelsModule,
		FriendsModule
	],
	controllers: [UsersController, FriendsController],
	providers: [UsersService, UserDto, AvatarStatusGateway, FriendsService],
	exports: [UsersService, UserDto, AvatarStatusGateway]
})
export class UsersModule { }
