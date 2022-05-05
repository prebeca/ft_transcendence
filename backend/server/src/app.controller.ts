import { Controller, Get, Inject } from '@nestjs/common';
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

	@Get('members')
	getMembers() {
		//console.log(this.config.get<string>('APPLICATION_SECRET'));
		//console.log(this.config.get<string>('DB_HOST'));
		return this.appService.getMembers();
	}
}
