import { Controller, Get, Res, Post, Param, Request, UseGuards, Redirect, Inject, Query} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config'; 

@Controller()
export class AuthController {
	constructor(private authService: AuthService){}

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('auth/login')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	getLogin() {
		return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=' + 'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1' + '&redirect_uri=' + 'http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcode'+ '&response_type=code' };
	}

	@Get('auth/code')
	getCode(@Query('code') code?: string){
		return this.authService.getToken(code);
	}
	/*async login(@Request() req)
	{
		//https://api.intra.42.fr/oauth/authorize
		console.log("inside auth/login post");
		return this.authService.login(req.user);
	}*/
	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
