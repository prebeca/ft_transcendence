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
import { LocalStrategy } from './strategies/local.strategy';
import { JwtTwoFaStrategy } from './strategies/jwt-twofa.strategy';
import { TwoFactorAuthService } from './services/twofa.service';
import { TwoFactorAuthController } from './controllers/twofa.controller';
import { WsJwtStrategy } from './strategies/ws-jwt.strategy';
import { JwtRtStrategy } from './strategies/jwt-rt.strategy';

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		PassportModule,
		HttpModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [AuthController, TwoFactorAuthController],
	providers: [AuthService, TwoFactorAuthService, JwtStrategy, JwtTwoFaStrategy, LocalStrategy, WsJwtStrategy, JwtRtStrategy],
	exports: [AuthService, JwtStrategy, JwtTwoFaStrategy, WsJwtStrategy, JwtRtStrategy],
})

export class AuthModule { }
