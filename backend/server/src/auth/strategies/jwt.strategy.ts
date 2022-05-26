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
		return req.cookies['access_token'];
	}
	return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly userService: UsersService) {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		console.log("payload: " + JSON.stringify(payload));
		if (!payload)
			throw new UnauthorizedException("No credentials cookie found");
		const user: User = await this.userService.findUsersById(payload.id);
		console.log(JSON.stringify(user));
		if (!user)
			throw new UnauthorizedException("No match for current session");
		return user;
	}
}
