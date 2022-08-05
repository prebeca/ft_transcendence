import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as FormData from 'form-data';
import { UserDto } from 'src/users/dto/users.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import cookiePayload from '../interfaces/cookiePayload.interface';
import { JwtPayload } from '../interfaces/JwtPayload.interface';
import jwtUser from '../interfaces/jwtUser.interface';
import { LoginInterface } from '../interfaces/login.interface';
import { RegisterInterface } from '../interfaces/register.interface';

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
			refresh_token: this.jwtService.sign({ id: userid }, {
				secret: this.config.get<string>('JWT_RT_SECRET'),
				expiresIn: `${this.config.get<string>('JWT_RT_EXPIRATION_TIME')}d`
			}),
		};
	}

	async createRTCookie(userid: number) {
		const rt_token: string = (await this.rtGenerate(userid)).refresh_token;
		return rt_token;
	}

	async refreshTokens(response: Response, user: User): Promise<Response> {
		const token_client: { access_token: string } = await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser });
		const token: string = token_client.access_token;
		response.cookie('access_token', token, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 20,
			sameSite: "strict",
			/* secure: true, -> only for localhost AND https */
		});
		const rt_token: string = await this.createRTCookie(user.id);
		const hash_token: string = await bcrypt.hash(rt_token, 5);
		this.usersService.updateUsersById(user, { refresh_token: hash_token });
		response.cookie('refresh_token', rt_token, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 24 * 15,
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
			var userCookie: User = await this.usersService.findUserbyIdWithSensibleData(result.user.id);
		}
		else {
			userid = user.id;
			token_client = (await this.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser })).access_token;
		}

		if (!token_client)
			return null;

		response.cookie('access_token', token_client, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 20,
			sameSite: "strict",
			/* secure: true, -> only for localhost AND https */
		});

		const rt_token: string = await this.createRTCookie(userid);
		const hash_token: string = await bcrypt.hash(rt_token, 5);
		this.usersService.updateUsersById(userCookie, { refresh_token: hash_token });

		response.cookie('refresh_token', rt_token, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 1000,
			sameSite: "strict",
		});

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
				return null;
			});

		if (!res2)
			throw new HttpException("Call to 42API failed", HttpStatus.INTERNAL_SERVER_ERROR);

		createUserDto = {
			...createUserDto,
			login: res2.data.login,
			username: res2.data.login,
			email: res2.data.email,
		};

		var user: User = await this.usersService.findOne(createUserDto.login);
		if (!user) {
			let same_username: string = res2.data.login;
			for (let i = 0; i < 1000000; i++) {
				var same_user: User = await this.usersService.findOneByUsername(same_username);
				if (!same_user)
					break;
				same_username = (res2.data.login as string).concat(i.toString());
			}
			createUserDto.username = same_username;
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
				+ this.config.get<string>('APPLICATION_UID')
				+ '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2F42callback'
				+ '&response_type=code&scopepublic'
		};
	}

	async validatePassword(user: User, pass: string): Promise<boolean> {
		return await bcrypt.compare(pass, user.password);
	}

	async validateUser(loginPayload: LoginInterface): Promise<User> {
		let email_str: string = loginPayload.email;
		if (this.containsSpecialChars(email_str, true))
			throw new HttpException("Email cannot contain special characters", HttpStatus.CONFLICT);
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

	containsSpecialChars(str: string, is_email: boolean) {
		const specialChars: string = `\`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`;

		const result: boolean = specialChars.split('').some(specialChar => {
			if (str.includes(specialChar)) {
				if (is_email && (specialChar === '@' || specialChar === '.'))
					return false;
				return true;
			}
			return false;
		});
		return result;
	}

	async registerUser(registerUser: RegisterInterface): Promise<User> {
		let username_str: string = registerUser.username;
		if (this.containsSpecialChars(username_str, false))
			throw new HttpException("Username cannot contain special characters", HttpStatus.CONFLICT);
		let email_str: string = registerUser.email;
		if (this.containsSpecialChars(email_str, true))
			throw new HttpException("Email cannot contain special characters", HttpStatus.CONFLICT);
		var user: User = await this.usersService.findOneByEmail(registerUser.email);
		if (!user) {
			user = await this.usersService.findOneByUsername(registerUser.username);
			if (user)
				throw new HttpException("Username already used", HttpStatus.CONFLICT);
		}
		else {
			throw new HttpException("Email already used", HttpStatus.CONFLICT);
		}
		if (registerUser.email.indexOf("@student.42.fr") !== -1) {
			throw new HttpException("42 Email used", HttpStatus.NOT_ACCEPTABLE);
		}
		try {
			const salt_pass = await bcrypt.genSalt();
			const hash_pass = await bcrypt.hash(registerUser.password, salt_pass);
			const createUserDto: UserDto = {
				email: registerUser.email,
				salt: salt_pass,
				password: hash_pass,
				username: registerUser.username
			}
			return this.usersService.createUser(createUserDto);
		} catch (error) {
			throw new HttpException("Register failed", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async logout(response: Response, user: User) {
		response.clearCookie('access_token', {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 20,
			sameSite: "strict",
		});
		response.clearCookie('refresh_token', {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 1000,
			sameSite: "strict",
		});
		this.usersService.updateUsersById(user, { refresh_token: null, socket_id: null });
	}
}
