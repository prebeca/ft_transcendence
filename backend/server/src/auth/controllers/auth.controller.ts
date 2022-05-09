import { Controller, Get, Res, Req, Request, UseGuards, Redirect, Inject, Query} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config'; 
import { Response } from 'express';
import { FtGuard } from '../guards/ft.guard';

@Controller()
export class AuthController {
	constructor(private authService: AuthService){}

	states: String[] = [];

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@UseGuards(FtGuard)
	@Get('auth/login')
	async getLogin(@Req() req: any, @Res() response: Response): Promise<void> {
		console.log('+++getLogin+++');
		var state = require('crypto').randomBytes(64).toString('hex');
     	this.states.push(state);

		const url = new URL(`${req.protocol}:${req.hostname}`);
		url.port = process.env.FRONT_PORT;
		url.pathname = 'login';
		url.searchParams.set('code', 'abcde');
		response.status(302).redirect(url.href);
	}

	@Get('auth/code')
	@Redirect('http://localhost:8080/', 302)
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

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
