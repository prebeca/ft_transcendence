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

	@UseGuards(FTAuthGuard)
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
	}

/*	@Get('auth/code')
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
	}*/
}
