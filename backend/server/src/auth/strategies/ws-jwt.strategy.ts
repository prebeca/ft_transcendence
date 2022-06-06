import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from "socket.io";
import { jwtConstants } from '../constants';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

const name_cookie: string = "access_token";

const cookieExtractorWs = function (client: Socket): String {
	if (client.handshake.headers?.cookie) {
		const array_cookie: string[] = client.handshake.headers.cookie.split(";");
		const array_length: number = array_cookie.length;
		for (var i = 0; i < array_cookie.length; i++) {
			let index: number = array_cookie[i].search(name_cookie);
			if (index > -1) {
				return array_cookie[i].substring(index + name_cookie.length + 1);
			}
		}
		return null;
	}
	return null;
};

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, "ws-jwt") {
	constructor(
		private readonly userService: UsersService) {
		super({
			jwtFromRequest: cookieExtractorWs,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		if (!payload)
			throw new UnauthorizedException("No credentials cookie found");
		const user: User = await this.userService.findUsersByIdWithRelations(payload.id);
		if (!user)
			throw new UnauthorizedException("No match for current session");
		return user;
	}
}
