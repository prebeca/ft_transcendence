import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

const cookieExtractor = function (req: Request): String {
	if (req?.cookies) {
		return req.cookies['refresh_token'];
	}
	return null;
};

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
	constructor(
		private readonly userService: UsersService) {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.rtSecret,
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		console.log("rt strat");
		if (!payload)
			throw new UnauthorizedException("No credentials cookie found");
		const user: User = await this.userService.findUsersByIdWithRelations(payload.id);
		if (!user)
			throw new UnauthorizedException("No match for current session");
		return { ...user, email: undefined };
	}
}
