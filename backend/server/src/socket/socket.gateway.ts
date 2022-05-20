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
	async joinChannel(@MessageBody() data: Message, @ConnectedSocket() client: Socket,) {
		console.log("Joining channel !")
		console.log(data)
		await this.channelService.addMessageToChannel(data.channel_id, data);
		await client.join(data.channel_id.toString())
		this.socketService.joinChannel(data.channel_id, data.user_id)
		this.server.to(data.channel_id.toString()).emit('NewMessage', data);
	}

	@SubscribeMessage('MessageSend')
	async handleMsgDistrib(@MessageBody() data: Message, @ConnectedSocket() client: Socket,) {
		console.log("Handle message distribution !")
		console.log(data)
		if (data.type == "cmd") {
			// TODO handle cmd
			// this.server.to(data.channel_id.toString()).emit('NewMessage');
			let answer: Message;
			if (data.content.toLowerCase() == "/clear")
				answer = await this.channelService.clearChat(data.channel_id);
			this.server.to(answer.channel_id.toString()).emit('NewMessage', answer);
		}
		else {
			await this.channelService.addMessageToChannel(data.channel_id, data);
			this.server.to(data.channel_id.toString()).emit('NewMessage');
		}
	}

}
