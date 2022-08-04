import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { FriendsController } from 'src/friends/controllers/friends.controller';
import { FriendsModule } from 'src/friends/friends.module';
import { FriendsService } from 'src/friends/services/friends.service';
import { Player } from 'src/game/entities/player.entity';
import { User } from 'src/typeorm';
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
