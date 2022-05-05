
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: {expiresIn: '7200s'},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, /* FtStrategy,*/ LocalStrategy, JwtStrategy],
	exports: [AuthService],
})

export class AuthModule {}