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
	async authenticate42User(@Res({ passthrough: true }) response: Response, @Query('code') code: string) {
		const ret: { response: Response, istwofa: boolean } = await this.authService.createCookie(response, true, code, null);
		response = ret.response;
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
		if (ret.istwofa)
			return { url: `${process.env.APPLICATION_REDIRECT_URI}/login/2fa` };
	}


	@UsePipes(ValidationPipe)
	@Post('register')
	async register(@Body() userCredentials: RegisterAuthDto): Promise<User> {
		console.log(userCredentials);
		const registerUser = { ...userCredentials };
		return this.authService.registerUser(registerUser);
	}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Req() req: Request) {
		const user: User = { ...req.user as User };
		if (!user)
			throw new UnauthorizedException("Credentials don't match");
		const ret: { response: Response, istwofa: boolean } = await this.authService.createCookie(response, false, null, user);
		response = ret.response;
		if (!response)
			throw new UnauthorizedException("JWT Generation error");
		if (ret.istwofa)
			return { url: `${process.env.APPLICATION_REDIRECT_URI}/login/2fa` };
	}
	//Login returns nothing but set a cookie with user information (username/login with id)
	//The logic now is to add twofauser set to false or true in the cookie
	//THEN, in every route, check if the user is a twofauser and if the secret was already entered,
	//if the user is not a twofauser proceed, if the code is false, throw a new UnauthorizedException()
	//


	/*
	@Post('/signin')
	signIn(
		@Body(ValidationPipe) signinCredentialsDto: SignInCredentialsDto
	): Promise<{ accessToken: string, refreshToken?: string, user?: JwtPayload }>{
		return this.authService.signIn(signinCredentialsDto);
	}*/
}
