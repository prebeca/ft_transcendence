import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-jwt'
import { User } from "../../users/entities/user.entity";
import { UsersService } from "../../users/services/users.service";
import { Request } from "express";
import { jwtConstants } from "../constants";
import { JwtPayload } from "../interfaces/JwtPayload.interface";

const cookieExtractor = function (req: Request): String {
	if (req?.cookies) {
		return req.cookies['access_token'];
	}
	return null;
};

@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-twofa') {
	constructor(
		private readonly userService: UsersService) {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		const user = await this.userService.findUserbyIdWithSensibleData(payload.id);
		if (!user) {
			throw new UnauthorizedException("user not found")
		}
		const user_to_manipulate = { ...await this.userService.findUsersByIdWithRelations(user.id), email: undefined };
		if (!user.twofauser) {
			return user_to_manipulate;
		}
		if (payload.isTwoFaAuthenticated) {
			return user_to_manipulate;
		}
	}
}
