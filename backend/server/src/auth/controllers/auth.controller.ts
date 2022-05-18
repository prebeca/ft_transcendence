import { Controller, Get, Res, Redirect, Inject, Query, Post, Request, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('42login')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	redirect42API() {
		// Pour tpierre
		// return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=9636f7cfa95d97b39cb1692f878d8d528cdacb742d07235819f04aee71f38232&redirect_uri=http%3A%2F%2F176.144.250.217%3A3000%2Fauth%2Flogin&response_type=code&scopepublic&state=' + state };
		// Pour localhost
		return this.authService.get42OAuthURL();
	}

	@Get('42callback')
	@Redirect(`${process.env.APPLICATION_REDIRECT_URI}/login`, 302)
	async authenticate42User(@Res({ passthrough: true }) response: Response, @Query('code') code: string) {
		console.log('---authenticate42User---');

		const token_client: string = await this.authService.get42APIToken(code);
		response.cookie('access_token', token_client, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 15,
			//secure: true,
		});
	}

	@Post('register')
	async register(@Req() req: Request) {
		return this.authService.registerUser(req.body["email"], req.body["username"], req.body["password"]);
	}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Request() req) {
		const token_client: any = await this.authService.jwtGenerate(req.user["login"], req.user["id"]);
		response.cookie('access_token', token_client.access_token, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 15,
			//secure: true,
		});
	}
}
