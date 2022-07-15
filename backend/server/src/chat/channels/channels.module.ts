import { forwardRef, Module } from '@nestjs/common';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelsService } from './services/channels.service';
import { CreateChannelDto } from './dto/channels.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Ban, Mute } from 'src/typeorm';
import { UsersModule } from 'src/users/users.module';
import { CreateMessageDto } from './dto/messages.dto';
import { Message } from './entities/message.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Channel, Message, Ban, Mute]), forwardRef(() => UsersModule)],
	controllers: [ChannelsController],
	providers: [ChannelsService, CreateChannelDto, CreateMessageDto],
	exports: [ChannelsService, CreateChannelDto, CreateMessageDto]
})
export class ChannelsModule { }
