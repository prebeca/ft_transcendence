import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { jwtConstants } from './constants';
import { AuthController } from './controllers/auth.controller';
import { TwoFactorAuthController } from './controllers/twofa.controller';
import { AuthService } from './services/auth.service';
import { TwoFactorAuthService } from './services/twofa.service';
import { JwtRtStrategy } from './strategies/jwt-rt.strategy';
import { JwtTwoFaStrategy } from './strategies/jwt-twofa.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { WsJwtStrategy } from './strategies/ws-jwt.strategy';

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		PassportModule,
		HttpModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '5h' },
		}),
	],
	controllers: [AuthController, TwoFactorAuthController],
	providers: [AuthService, TwoFactorAuthService, JwtStrategy, JwtTwoFaStrategy, LocalStrategy, WsJwtStrategy, JwtRtStrategy],
	exports: [AuthService, JwtStrategy, JwtTwoFaStrategy, WsJwtStrategy, JwtRtStrategy],
})

export class AuthModule { }
