import { Module } from '@nestjs/common';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelsService } from './services/channels.service';
import { CreateChannelDto } from './dto/channels.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Channel])],
	controllers: [ChannelsController],
	providers: [ChannelsService, CreateChannelDto],
	exports: [ChannelsService, CreateChannelDto]
})
export class ChannelsModule { }
