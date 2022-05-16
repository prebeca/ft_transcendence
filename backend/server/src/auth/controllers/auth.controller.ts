import { Controller, Get, Res, Req, UseGuards, Redirect, Inject, Query, Post} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { sign } from 'crypto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService){}

	states: String[] = [];

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('a')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	getLogin() {
		console.log('+++getLogin+++');
		var state = require('crypto').randomBytes(64).toString('hex');
		this.states.push(state);

		// Pour tpierre
		// return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=9636f7cfa95d97b39cb1692f878d8d528cdacb742d07235819f04aee71f38232&redirect_uri=http%3A%2F%2F176.144.250.217%3A3000%2Fauth%2Flogin&response_type=code&scopepublic&state=' + state };

		// Pour localhost

		return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=' +
			'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1' +
			'&redirect_uri=' + 'http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flogin' +
			'&response_type=code&scopepublic&state=' +
			state
		};
	}

	@Get('login')
	@Redirect(`${process.env.APPLICATION_REDIRECT_URI}/login`, 302)
	async getCode(@Res({ passthrough: true }) response: Response, @Query('code') code?: string, @Query('state') state?: string){
		console.log('+++getCode+++');
		var found = this.states.findIndex(String => String == state);
		if (found >= 0) {
			this.states.splice(found);
			const token_client: string = await this.authService.getToken(code, state);
			console.log('cookie = ' + token_client);

			response.cookie('access_token', token_client, {
				httpOnly: true,
				maxAge: 1000 * 60 * 15,
				secure: true,
			});
		}
		else {
			console.log('state not found');
			return null;
		}
	}
}
