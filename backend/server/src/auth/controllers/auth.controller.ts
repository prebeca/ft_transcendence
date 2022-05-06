import { Controller, Get, Res, Post, Param, Request, UseGuards, Redirect, Inject, Query} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config'; 

@Controller()
export class AuthController {
	constructor(private authService: AuthService){}

	states: String[] = [];

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('auth/login')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	getLogin() {
		console.log('+++getLogin+++');
		var state = require('crypto').randomBytes(64).toString('hex');
     	this.states.push(state);
		return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=' + 'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1' + '&redirect_uri=' + 'http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcode'+ '&response_type=code&scopepublic&state=' + state};
	}

	@Get('auth/code')
	getCode(@Query('code') code?: string, @Query('state') state?: string){
		console.log('+++getCode+++');
		var found = this.states.findIndex(String => String == state);
		if (found >= 0) {
			this.states.splice(found);
			return this.authService.getToken(code, state);
		}
		else
		{
			console.log('state not found');
			return null;
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
