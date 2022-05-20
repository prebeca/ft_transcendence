import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Channel } from 'diagnostics_channel';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Message } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { SocketService } from './socket.service';


@WebSocketGateway({ cors: true })
export class SocketGateway {
	constructor(private readonly socketService: SocketService, private readonly channelService: ChannelsService) { }

	@WebSocketServer()
	server: Server;


	@SubscribeMessage('JoinChan')
	async joinChannel(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
		await this.socketService.joinChannel(data, client, this.server)
	}

	@SubscribeMessage('MessageSend')
	async handleMsgDistrib(@MessageBody() data: Message, @ConnectedSocket() client: Socket) {
		await this.socketService.handleMsgDistrib(data, client, this.server)
	}

}
