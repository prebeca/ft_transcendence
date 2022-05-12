import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Request } from 'express';

const cookieExtractor = function(req: Request): String {
    if(req?.cookies) {
        return req.cookies['access_token'];
    }
	return null;
  };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: cookieExtractor,
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any){
		return {userId: payload.sub, username: payload.username};
	}
}
