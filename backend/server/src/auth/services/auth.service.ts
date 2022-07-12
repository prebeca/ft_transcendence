import { Injectable, Inject, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/user.entity';
import * as FormData from 'form-data';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { LoginInterface } from '../interfaces/login.interface';
import { RegisterInterface } from '../interfaces/register.interface';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import jwtUser from '../interfaces/jwtUser.interface';
import cookiePayload from '../interfaces/cookiePayload.interface';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	async jwtGenerate(payload: JwtPayload): Promise<{ access_token: string }> {
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async rtGenerate(userid: number): Promise<{ refresh_token: string }> {
		return {
			refresh_token: this.jwtService.sign({ userid: userid }, {
				secret: this.config.get<string>('JWT_RT_SECRET'),
				expiresIn: `${this.config.get<string>('JWT_RT_EXPIRATION_TIME')}s`
			}),
		};
	}

	async createRTCookie(response: Response, userid: number) {
		const rt_token: string = (await this.rtGenerate(userid)).refresh_token;
		response.cookie('refresh_token', rt_token, {
			httpOnly: true,
			path: '/',
			maxAge: this.config.get<number>('JWT_RT_EXPIRATION_TIME'),
			sameSite: "strict",
		});
		return response;
	}


	async createCookie(response: Response, is42: boolean, code: string, user?: User): Promise<cookiePayload> {
		var token_client: string;
		var userCookie: User = user;
		var userid: number;
		if (is42) {
			const result: { jwt: { access_token: string }, user: User } = (await this.get42APIToken(code));
			userid = result.user.id;
			token_client = result.jwt.access_token;
			var userCookie: User = { ...result.user as User };
		}
		else {
			userid = user.id;
			token_client = (await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser })).access_token;
		}
		console.log("userid = " + userid);
		if (!token_client)
			return null;

		response.cookie('access_token', token_client, {
			httpOnly: true,
			path: '/',
			maxAge: 60 * 5,
			sameSite: "strict",
			/* secure: true, -> only for localhost AND https */
		});
		response = await this.createRTCookie(response, userid);
		let created: boolean = (userCookie.username) ? false : true;
		return {
			userid: userid,
			response: response,
			created: created,
			istwofa: userCookie.twofauser
		}
	}

	async getUser42Infos(access_token: string, createUserDto: UserDto): Promise<jwtUser> {
		const config: AxiosRequestConfig = {
			method: 'get',
			url: 'https://api.intra.42.fr/v2/me',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
		}
		let res2: AxiosResponse = await axios(config)
			.then(function (response: AxiosResponse) {
				return response;
			})
			.catch(function (response) {
				console.log("Error getUserInfos =>" + response);
				return null;
			});

		if (!res2)
			throw new InternalServerErrorException("Call to 42API failed");

		createUserDto = {
			...createUserDto,
			login: res2.data.login,
			email: res2.data.email,
		};

		var user: User = await this.usersService.findOne(createUserDto.login);
		if (!user) {
			user = await this.usersService.createUser(createUserDto);
			if (user === null)
				return null;
		}
		const result_jwtsign: { access_token: string } = await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser });
		return {
			jwt: result_jwtsign,
			user: user
		}
	}


	async get42APIToken(code_api: string): Promise<jwtUser> {
		const formData = new FormData();
		let access_token: string;
		var res: AxiosResponse;

		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', this.config.get<string>('NEW_APPLICATION_UID'));
		formData.append('client_secret', this.config.get<string>('NEW_APPLICATION_SECRET'));
		formData.append('code', code_api);
		formData.append('redirect_uri', this.config.get<string>('BASE_URL') + '/auth/42callback');

		await axios
			.post('https://api.intra.42.fr/oauth/token', formData, {
				headers: formData.getHeaders()
			})
			.then(function (response: AxiosResponse): void {
				res = response;
			})
			.catch(function (response: AxiosResponse): void {
				console.log("Error getToken =>" + response);
				return null;
			});

		access_token = res.data.access_token;
		var createUserDto = new UserDto();
		createUserDto = {
			...createUserDto,
			refresh_token: res.data.access_token,
			fortytwouser: true,
		};
		return await this.getUser42Infos(access_token, createUserDto);
	}

	get42OAuthURL(): { url: string } {
		return {
			url: 'https://api.intra.42.fr/oauth/authorize?client_id='
				+ this.config.get<string>('NEW_APPLICATION_UID')
				+ '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42callback'
				+ '&response_type=code&scopepublic'
		};
	}

	async validatePassword(user: User, pass: string): Promise<boolean> {
		return await bcrypt.compare(pass, user.password);
	}

	async validateUser(loginPayload: LoginInterface): Promise<User> {
		const user: User = await this.usersService.findOneByEmail(loginPayload.email);
		if (user) {
			const passIsCorrect = await this.validatePassword(user, loginPayload.password);
			if (passIsCorrect) {
				const { password, salt, ...result } = user;
				return (result as User);
			}
			else
				throw new UnauthorizedException("Password is not correct");
		}
		throw new UnauthorizedException("User does not exist");
	}

	async registerUser(registerUser: RegisterInterface): Promise<User> {
		try {
			const salt_pass = await bcrypt.genSalt();
			const hash_pass = await bcrypt.hash(registerUser.password, salt_pass);
			const createUserDto: UserDto = {
				email: registerUser.email,
				salt: salt_pass,
				password: hash_pass,
				username: registerUser.username,
				login: registerUser.username
			}
			return this.usersService.createUser(createUserDto);
		} catch (error) {
			throw new InternalServerErrorException("Password hashing failed");
		}
	}
}
