import { Controller, Get, Inject, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';


@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
