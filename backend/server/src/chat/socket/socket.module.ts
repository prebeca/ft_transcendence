import { Module } from '@nestjs/common';
import { ChannelsModule } from '../../chat/channels/channels.module';
import { UsersModule } from '../../users/users.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
	providers: [SocketGateway, SocketService],
	imports: [ChannelsModule, UsersModule]
})
export class SocketModule { }
