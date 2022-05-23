import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private createUserDto: UserDto
	) { }

	@Inject(ConfigService)
	private readonly config: ConfigService;

	async jwtGenerate(userlogin: string, userid: number) {
		const payload = { username: userlogin, id: userid };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async createCookie(response: Response, is42: boolean, code: string, req?: any): Promise<Response> {
		const token_client: string = is42 ?
			await this.get42APIToken(code) :
			(await this.jwtGenerate(req.user["login"], req.user["id"])).access_token;

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

	async getUser42Infos(access_token: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'get',
			url: 'https://api.intra.42.fr/v2/me',
			headers: {
				'Authorization': 'Bearer ' + access_token
			},
		}
		let res2: AxiosResponse;
		await axios(config)
			.then(function (response: AxiosResponse) {
				res2 = response;
			})
			.catch(function (response) {
				console.log("Error getUserInfos =>" + response);
			});
		this.createUserDto.login = res2.data.login;
		this.createUserDto.email = res2.data.email;
		this.createUserDto.username = res2.data.login;

		var user: User = await this.usersService.findOne(this.createUserDto.login);
		if (!user) {

			user = this.usersService.createUser(this.createUserDto);
			if (user === null)
				return null;
		}
		const result_jwtsign: any = await this.jwtGenerate(res2.data.login, user.id);
		return result_jwtsign.access_token;
	}


	async get42APIToken(code_api: string): Promise<string> {
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
		this.createUserDto.access_token = res.data.access_token;
		this.createUserDto.refresh_token = res.data.refresh_token;
		this.createUserDto.scope = res.data.scope;
		this.createUserDto.created_at = res.data.created_at;
		this.createUserDto.expires_in = res.data.expires_in;
		return this.getUser42Infos(access_token);
	}

	get42OAuthURL() {
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
			return null;
		}
		else
			return null;
	}

	async registerUser(registerUser: RegisterInterface) {
		console.log('email = ' + registerUser.email + ', password = ' + registerUser.password);
		try {
			const salt_pass = await bcrypt.genSalt();
			const hash_pass = await bcrypt.hash(registerUser.password, salt_pass);
			this.createUserDto.email = registerUser.email;
			this.createUserDto.salt = salt_pass;
			this.createUserDto.password = hash_pass;
			this.createUserDto.username = registerUser.username;
			this.createUserDto.login = registerUser.username;
		} catch (error) {
			throw new InternalServerErrorException("Password hashing failed");
		}
		return this.usersService.createUser(this.createUserDto);
	}
}
