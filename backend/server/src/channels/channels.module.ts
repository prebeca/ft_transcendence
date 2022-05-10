import { Module } from '@nestjs/common';
import { ChannelsService } from './services/channels.service';
import { CreateChannelDto } from './dto/channel.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';
import { ChannelsController } from './controllers/channels.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Channel])],
	controllers: [ChannelsController],
	providers: [ChannelsService, CreateChannelDto],
	exports: [ChannelsService, CreateChannelDto]
})
export class ChannelsModule { }
