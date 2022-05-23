import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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

	async validate(payload: JwtPayload): Promise<any> {
		const user: User = await this.userService.findUsersById(payload.id);
		if (!user)
			throw new UnauthorizedException();
		return user;
	}
}
