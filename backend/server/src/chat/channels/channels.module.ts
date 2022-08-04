import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban, Channel, Mute } from 'src/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChannelsController } from './controllers/channels.controller';
import { CreateChannelDto } from './dto/channels.dto';
import { Message } from './entities/message.entity';
import { ChannelsService } from './services/channels.service';

@Module({
	imports: [TypeOrmModule.forFeature([Channel, Message, Ban, Mute]), forwardRef(() => UsersModule)],
	controllers: [ChannelsController],
	providers: [ChannelsService, CreateChannelDto],
	exports: [ChannelsService, CreateChannelDto]
})
export class ChannelsModule { }
