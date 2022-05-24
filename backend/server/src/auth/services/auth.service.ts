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

	async createCookie(response: Response, is42: boolean, code: string, user?: User): Promise<Response> {
		console.log(is42);
		const token_client: string = is42 ?
			(await this.get42APIToken(code)).access_token :
			(await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser })).access_token;

		if (!token_client)
			return null;

		response.cookie('access_token', token_client, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 15,
			/* secure: true, -> only for localhost AND https */
		});
		return response;
	}

	async getUser42Infos(access_token: string, createUserDto: UserDto): Promise<{ access_token: string }> {
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
			username: res2.data.username
		};

		var user: User = await this.usersService.findOne(createUserDto.login);
		console.log(user);
		if (!user) {
			user = await this.usersService.createUser(createUserDto);
			if (user === null)
				return null;
		}
		const result_jwtsign: any = await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser });
		return result_jwtsign;
	}


	async get42APIToken(code_api: string): Promise<{ access_token: string }> {
		const formData = new FormData();
		let access_token: string;
		var res: AxiosResponse;

		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', this.config.get<string>('APPLICATION_UID'));
		formData.append('client_secret', this.config.get<string>('APPLICATION_SECRET'));
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
			access_token: res.data.access_token,
			refresh_token: res.data.access_token,
			scope: res.data.scope,
			fortytwouser: true,
			created_at: res.data.created_at,
			expires_in: res.data.expires_in
		};
		return await this.getUser42Infos(access_token, createUserDto);
	}

	get42OAuthURL(): { url: string } {
		return {
			url: 'https://api.intra.42.fr/oauth/authorize?client_id='
				+ this.config.get<string>('APPLICATION_UID')
				+ '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42callback'
				+ '&response_type=code&scopepublic'
		};
	}

	async validatePassword(user: User, pass: string): Promise<boolean> {
		return await bcrypt.compare(pass, user.password);
	}

	async validateUser(loginPayload: LoginInterface): Promise<User> {
		console.log('email = ' + loginPayload.email + ', password = ' + loginPayload.password);
		const user: User = await this.usersService.findOneByEmail(loginPayload.email);
		if (user) {
			const passIsCorrect = await this.validatePassword(user, loginPayload.password);
			console.log("The password is " + (passIsCorrect ? "correct" : "false"));
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
		console.log('email = ' + registerUser.email + ', password = ' + registerUser.password);
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
	/*
		async signIn(signInCredentialsDto: SignInCredentialsDto): Promise<{ accessToken: string, refreshToken?: string, user?: JwtPayload }> {
			const resp: User = await this.userRepository.validateUserPassword(signInCredentialsDto);
				
			if (!resp) {
				throw new UnauthorizedException('Invalid credentials');
			}
		
			const accessToken = await this.jwtGenerate(resp.username, resp.id, resp.twofauser);
		
			if (resp.twofauser) {
				return {
					accessToken
				}
			}

			return {
				accessToken,
				user: resp
			}
		 }*/
}
