import { Controller, Get, Res, Redirect, Inject, Query, Post, Req, UnauthorizedException, ValidationPipe, UsePipes, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Get('42login')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	redirect42API(): { url: string } {
		/* Pour tpierre
		** return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=9636f7cfa95d97b39cb1692f878d8d528cdacb742d07235819f04aee71f38232&redirect_uri=http%3A%2F%2F176.144.250.217%3A3000%2Fauth%2Flogin&response_type=code&scopepublic&state=' + state };
		*/
		return this.authService.get42OAuthURL();
	}

	@Get('42callback')
	@Redirect(`${process.env.APPLICATION_REDIRECT_URI}/login/complete-profile`, 302)
	async authenticate42User(@Res({ passthrough: true }) response: Response, @Query('code') code: string): Promise<void> {
		response = await this.authService.createCookie(response, true, code, null);
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
	}


	@UsePipes(ValidationPipe)
	@Post('register')
	async register(@Body() userCredentials: RegisterAuthDto): Promise<User> {
		console.log(userCredentials);
		const registerUser = { ...userCredentials };
		return await this.authService.registerUser(registerUser);
	}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Req() req: Request): Promise<void> {
		console.log(req.user);
		response = await this.authService.createCookie(response, false, null, req);
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
	}
}
