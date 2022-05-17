import { WebSocketGateway } from '@nestjs/websockets';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: true })
export class SocketGateway {
  constructor(private readonly socketService: SocketService) {}
}
