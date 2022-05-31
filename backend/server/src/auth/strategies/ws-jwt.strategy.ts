import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from "socket.io";
import { jwtConstants } from '../constants';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import { UsersService } from 'src/users/services/users.service';
import { User } from 'src/users/entities/user.entity';

const cookieExtractorWs = function (client: Socket): String {
	if (client.handshake.headers?.cookie) {
		const access_token: String = client.handshake.headers.cookie.split('=')[1];
		return access_token;
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
		console.log("payload: " + JSON.stringify(payload));
		if (!payload)
			throw new UnauthorizedException("No credentials cookie found");
		const user: User = await this.userService.findUsersById(payload.id);
		if (!user)
			throw new UnauthorizedException("No match for current session");
		return user;
	}
}
