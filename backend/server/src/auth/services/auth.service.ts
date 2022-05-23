import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/user.entity';
import * as FormData from 'form-data';
import * as bcrypt from 'bcrypt';

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
		const payload = { username: userlogin, sub: userid };
		return {
			access_token: this.jwtService.sign(payload),
		};
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

			user = await this.usersService.createUser(this.createUserDto);
			if (user === null)
				return null;
		}
		const result_jwtsign: any = await this.jwtGenerate(res2.data.login, user.id);
		return result_jwtsign.access_token;
	}

	async get42APIToken(code_api: string) {
		const formData = new FormData();
		let access_token: string;
		var res: AxiosResponse;

		formData.append('grant_type', 'authorization_code');
		formData.append('client_id', this.config.get<string>('APPLICATION_UID'));
		formData.append('client_secret', this.config.get<string>('APPLICATION_SECRET'));
		formData.append('code', code_api);
		formData.append('redirect_uri', this.config.get<string>('BASE_URL') + '/auth/42callback');

		await axios.post('https://api.intra.42.fr/oauth/token', formData, { headers: formData.getHeaders() })
			.then(function (response: AxiosResponse): void {
				res = response;
			}).catch(function (response: AxiosResponse): void {
				console.log("Error getToken =>" + response);
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

	async validateUser(email: string, pass: string): Promise<any> {
		console.log('email = ' + email + ', password = ' + pass);
		const user: User = await this.usersService.findOneByEmail(email);
		//console.log(user);
		if (user) {
			const passIsCorrect = await this.validatePassword(user, pass);
			console.log("The password is " + (passIsCorrect ? "correct" : "false"));
			if (passIsCorrect) {
				const { password, ...result } = user;
				return user;
			}
			return null;
		}
		else
			return null;
	}

	async registerUser(email: string, username: string, pass: string) {
		console.log('email = ' + email + ', password = ' + pass);
		const salt_pass = await bcrypt.genSalt();
		const hash_pass = await bcrypt.hash(pass, salt_pass);
		this.createUserDto.email = email;
		this.createUserDto.salt = salt_pass;
		this.createUserDto.password = hash_pass;
		this.createUserDto.username = username;
		this.createUserDto.login = username;
		return await this.usersService.createUser(this.createUserDto);
	}
}
