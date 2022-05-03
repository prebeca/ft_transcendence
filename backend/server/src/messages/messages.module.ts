import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService]
})
export class MessagesModule {}
