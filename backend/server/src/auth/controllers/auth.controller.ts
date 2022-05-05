import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller()
export class AuthController {
	constructor(private authService: AuthService){}

	@UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Request() req)
	{
		//https://api.intra.42.fr/oauth/authorize
		console.log("inside auth/login post");
		return this.authService.login(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
