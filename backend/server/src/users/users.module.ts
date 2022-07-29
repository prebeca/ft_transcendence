import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserDto } from './dto/users.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { Player } from 'src/game/entities/player.entity';
import { AvatarStatusGateway } from './gateways/avatarstatus.gateway';
import { FriendsController } from 'src/friends/controllers/friends.controller';
import { FriendsService } from 'src/friends/services/friends.service';
import { FriendsModule } from 'src/friends/friends.module';

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
