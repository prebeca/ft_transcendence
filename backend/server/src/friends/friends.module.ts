import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
	],
	providers: [FriendsService],
	controllers: [FriendsController]
})
export class FriendsModule { }
