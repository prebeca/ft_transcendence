import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Message } from 'src/chat/channels/entities/channel.entity';
import { ChannelsService } from 'src/chat/channels/services/channels.service';
import { SocketService } from './socket.service';


@WebSocketGateway({ cors: true })
export class SocketGateway {
	constructor(private readonly socketService: SocketService) { }
	private readonly channelService: ChannelsService

	@SubscribeMessage('MessageSend')
	async handleMsgDistrib(@MessageBody() data: Message, @ConnectedSocket() client: Socket,): Promise<Message> {
		console.log("Handle message distribution !")
		console.log(data)
		client.emit('NewMessage', data)
		this.channelService.addMessageToChannel(await this.channelService.getChannelsByName(data.channel).then(res => (res.id)), data);
		return data;
	}

}
