import { Controller, Get, Res, Redirect, Inject, Query, Post, Req, UnauthorizedException, ValidationPipe, UsePipes, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { AvatarStatusGateway } from 'src/users/gateways/avatarstatus.gateway';
import cookiePayload from '../interfaces/cookiePayload.interface';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	@Inject(AvatarStatusGateway)
	private gatewayStatus: AvatarStatusGateway;

	@Get('42login')
	@Redirect('https://api.intra.42.fr/oauth/authorize', 302)
	redirect42API(): { url: string } {
		// Pour tpierre
		//return { url: 'https://api.intra.42.fr/oauth/authorize?client_id=9636f7cfa95d97b39cb1692f878d8d528cdacb742d07235819f04aee71f38232&redirect_uri=http%3A%2F%2F176.144.250.217%3A3000%2Fauth%2F42callback&response_type=code&scopepublic&state='};
		return this.authService.get42OAuthURL();
	}

	@Get('42callback')
	@Redirect(`${process.env.APPLICATION_REDIRECT_URI}/login/complete-profile`, 302)
	async authenticate42User(@Res({ passthrough: true }) response: Response, @Query('code') code: string) {
		const ret: cookiePayload = await this.authService.createCookie(response, true, code, null);
		response = ret.response;
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
		if (ret.istwofa)
			return { url: `${process.env.APPLICATION_REDIRECT_URI}/login/2fa` };
		else if (!ret.created) {
			this.gatewayStatus.onConnection(ret.userid);
			return { url: `${process.env.APPLICATION_REDIRECT_URI}/home` };
		}
	}


	@UsePipes(ValidationPipe)
	@Post('register')
	async register(@Body() userCredentials: RegisterAuthDto): Promise<User> {
		return this.authService.registerUser({ ...userCredentials });
	}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Req() req: Request): Promise<boolean> {
		const user: User = { ...req.user as User };
		if (!user)
			throw new UnauthorizedException("Credentials don't match");
		const ret: cookiePayload = await this.authService.createCookie(response, false, null, user);
		response = ret.response;
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
		this.gatewayStatus.onConnection(ret.userid);
		return ret.istwofa;
	}
}
