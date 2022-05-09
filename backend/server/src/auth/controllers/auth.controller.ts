import { Controller, Get, Res, Req, UseGuards, Redirect, Inject, Query} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config'; 
import { Response } from 'express';
import { FTAuthGuard } from '../guards/ft-auth.guard';
import { FTUser } from '../interfaces/42User.interface';

@Controller()
export class AuthController {
	constructor(private authService: AuthService){}

	states: String[] = [];

	@Inject(ConfigService)
	private readonly config: ConfigService;

	/*@UseGuards(FTAuthGuard)
	@Get('auth/login')
	async getLogin(@Req() req: any, @Res() response: Response): Promise<void> {
		console.log('+++getLogin+++');
		const token = await this.authService.login(req.user as FTUser);

		const url = new URL(`${req.protocol}:${req.hostname}`);
		url.port = '8080';
		url.pathname = 'login';
		url.searchParams.set('code', token.access_token);
		console.log(url);
		response.status(302).redirect(url.href);
	}*/

	@Get('auth/a')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	getLogin() {
		console.log('+++getLogin+++');
		var state = require('crypto').randomBytes(64).toString('hex');
     	this.states.push(state);
		return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=' +
			'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1' +
			'&redirect_uri=' + 'http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flogin' +
			'&response_type=code&scopepublic&state=' +
			state
		};
	}

	@Get('auth/login')
	@Redirect('http://localhost:8080/login', 302)
	getCode(@Query('code') code?: string, @Query('state') state?: string){
		console.log('+++getCode+++');
		var found = this.states.findIndex(String => String == state);
		if (found >= 0) {
			this.states.splice(found);
			this.authService.getToken(code, state);
		}
		else
		{
			console.log('state not found');
			return null;
		}
	}
}
