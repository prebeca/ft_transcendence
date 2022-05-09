
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// import { FTStrategy } from './strategies/ft.strategy';

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		PassportModule,
		HttpModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: {expiresIn: '1d'},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})

export class AuthModule {}