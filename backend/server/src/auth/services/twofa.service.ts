import { AuthService } from "./auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { authenticator } from "otplib";
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { JwtPayload } from "../interfaces/JwtPayload.interface";
import { UsersService } from "src/users/services/users.service";

@Injectable()
export class TwoFactorAuthService {
	constructor(
		private userService: UsersService,
		private authService: AuthService
	) { }

	public async generateTwoFactorAuthSecret(user: User) {
		const auth: User = await this.userService.findUsersById(user.id);
		if (auth) {
			if (auth.twofauser) {
				return {
					msg: 'Already QR generated'
				}
			}
		}

		const secret = authenticator.generateSecret();
		const app_name = process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME;
		const otpAuthUrl = authenticator.keyuri(user.email, app_name, secret);

		await this.userService.updateUsersById(user, {});
		//await this.userService.update({ email: user.email }, { twofaSecret: secret });
		console.log('secret twofa generated = ' + secret);
		return {
			secret,
			otpAuthUrl
		}
	}

	public async qrCodeStreamPipe(stream: Response, otpPathUrl: string) {
		return toFileStream(stream, otpPathUrl);
	}

	public async activationOfTwoFa(user: User, status: boolean) {
		await this.userService.updateUsersById(user, {});
		/*return await this.userRepository.update({ email: email }, {
			twofauser: status
		});*/
	}

	public async verifyTwoFaCode(code: string, user: User) {
		return authenticator.verify({
			token: code,
			secret: user.twofasecret
		});
	}

	async signIn(user: User, isTwoFaAuthenticated: boolean): Promise<{ accessToken: string }> {
		const data = {
			isTwoFaAuthenticated,
			isTwoFactorEnable: user.twofauser,
			email: user.email,
		}
		const accessToken = (await this.authService.jwtGenerate({ email: user.email, id: user.id, isTwoFactorEnable: user.twofauser })).access_token;

		return {
			accessToken,
		};
	}
} 