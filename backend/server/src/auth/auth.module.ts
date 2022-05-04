
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
//import { FtStrategy } from './strategies/ft.strategy';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, /* FtStrategy,*/ LocalStrategy],
})

export class AuthModule {}