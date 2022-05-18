import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	providers: [SocketGateway, SocketService],
	imports: [ChannelsModule, UsersModule]
})
export class SocketModule { }
