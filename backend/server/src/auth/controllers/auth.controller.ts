import { Controller, Get, Res, Req, UseGuards, Redirect, Inject, Query, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('a')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	redirect42API() {
		console.log('---redirect42API---');
		var state: string = require('crypto').randomBytes(64).toString('hex');

		// Pour tpierre
		// return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=9636f7cfa95d97b39cb1692f878d8d528cdacb742d07235819f04aee71f38232&redirect_uri=http%3A%2F%2F176.144.250.217%3A3000%2Fauth%2Flogin&response_type=code&scopepublic&state=' + state };

		// Pour localhost
		return {
			url: 'https://api.intra.42.fr/oauth/authorize?client_id='
				+ this.config.get<string>('APPLICATION_UID')
				+ '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flogin'
				+ '&response_type=code&scopepublic&state='
				+ state
		};
	}

	@Get('login')
	@Redirect(`${process.env.APPLICATION_REDIRECT_URI}/login`, 302)
	async authenticate42User(@Res({ passthrough: true }) response: Response, @Query('code') code: string, @Query('state') state: string) {
		console.log('---authenticate42User---');
		const token_client: string = await this.authService.get42APIToken(code, state);

		response.cookie('access_token', token_client, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 15,
			//secure: true,
		});
	}
}
