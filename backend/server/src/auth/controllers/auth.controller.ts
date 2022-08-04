import { Body, Controller, Get, Inject, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { AvatarStatusGateway } from 'src/users/gateways/avatarstatus.gateway';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { JwtTwoFactorAuthGuard } from '../guards/jwt-twofa.guard';
import cookiePayload from '../interfaces/cookiePayload.interface';
import { AuthService } from '../services/auth.service';

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

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('logout')
	async logout(@Res({ passthrough: true }) response: Response, @Req() req: Request) {
		const user: User = { ...req.user as User };
		this.authService.logout(response, user);
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
		console.log(ret.userid);
		this.gatewayStatus.onConnection(ret.userid);
		return ret.istwofa;
	}
}
