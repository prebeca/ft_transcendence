import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Channel } from 'diagnostics_channel';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Message } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { SocketService } from './socket.service';


@WebSocketGateway({ cors: true })
export class SocketGateway {
	constructor(private readonly socketService: SocketService) { }
	private readonly channelService: ChannelsService

	@WebSocketServer()
	server: Server;


	@SubscribeMessage('JoinChan')
	async joinChannel(@MessageBody() data: Message, @ConnectedSocket() client: Socket,): Promise<Message> {
		console.log("Joining channel !")
		console.log(data)
		client.join(data.channel_id.toString())
		this.socketService.joinChannel(data.channel_id, data.sender_id)
		return data;
	}

	@SubscribeMessage('MessageSend')
	async handleMsgDistrib(@MessageBody() data: Message, @ConnectedSocket() client: Socket,): Promise<Message> {
		console.log("Handle message distribution !")
		console.log(data)
		this.server.to(data.channel_id.toString()).emit('NewMessage', data);
		return data;
	}

}
