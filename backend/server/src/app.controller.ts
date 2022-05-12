import { Controller, Get, Inject, Req, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('members')
	getMembers() {
		return this.appService.getMembers();
	}

	//@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() request: Request) {
		console.log("cookies: " + request.cookies['access_token']);
	 	//return req.user;
	}
}
