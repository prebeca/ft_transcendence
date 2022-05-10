import { Controller, Request, Get, Inject, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
	  return req.user;
	}
}
