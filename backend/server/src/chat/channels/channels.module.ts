import { forwardRef, Module } from '@nestjs/common';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelsService } from './services/channels.service';
import { CreateChannelDto } from './dto/channels.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from 'src/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [TypeOrmModule.forFeature([Channel]), forwardRef(() => UsersModule)],
	controllers: [ChannelsController],
	providers: [ChannelsService, CreateChannelDto],
	exports: [ChannelsService, CreateChannelDto]
})
export class ChannelsModule { }
