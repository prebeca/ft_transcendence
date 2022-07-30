import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException, Res, Req, Inject } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Request, Response } from 'express';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import * as bcrypt from 'bcrypt';

const cookieExtractor = function (req: Request): String {
	if (req?.cookies) {
		console.log(req.cookies['refresh_token']);
		return req.cookies['refresh_token'];
	}
	return null;
};

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
	constructor(
		private readonly userService: UsersService,
		private readonly authService: AuthService) {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.rtSecret,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: JwtPayload): Promise<User> {
		console.log("rt strat");
		if (!payload)
			throw new UnauthorizedException("No credentials cookie found");
		const user: User = await this.userService.findUsersByIdWithRelations(payload.id);
		if (!user)
			throw new UnauthorizedException("No match for current session");
		const ancient_refresh_token: string = (await this.userService.findUserbyIdWithSensibleData(user.id)).refresh_token;
		const matching: boolean = await bcrypt.compare(req.cookies['refresh_token'], ancient_refresh_token);
		if (!matching) {
			throw new UnauthorizedException("The refresh token does not match");
		}
		var response_to_modify: Response = req.res;
		req.res = await this.authService.refreshTokens(response_to_modify, user);
		return { ...user, email: undefined };
	}
}
