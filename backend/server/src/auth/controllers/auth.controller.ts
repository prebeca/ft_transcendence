import { Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Response } from 'express';
import { FtGuard } from '../guards/ft.guard';

@Controller()
export class AuthController {
	constructor() {}

	@Get()
	@UseGuards(FtGuard)
	async ftAuth(@Req() _req) {
		// Guard redirects
	}

	@Get('redirect')
	@UseGuards(FtGuard)
	async ftAuthRedirect(@Request() req, @Res() res: Response) {
		// For now, we'll just show the user object
		return req.user;
	}

	@UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Request() req){
		return req.user;
	}

}