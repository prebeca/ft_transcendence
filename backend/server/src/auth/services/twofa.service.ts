import { Injectable } from "@nestjs/common";
import { Response } from 'express';
import { authenticator } from "otplib";
import { toFileStream } from 'qrcode';
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/services/users.service";
import { AuthService } from "./auth.service";

@Injectable()
export class TwoFactorAuthService {
	constructor(
		private userService: UsersService,
		private authService: AuthService
	) { }

	public async generateTwoFactorAuthSecret(user: User) {
		const auth: User = await this.userService.findUserbyIdWithSensibleData(user.id);
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

		await this.userService.updateSecret2FA(user, secret);
		console.log('secret twofa generated = ' + secret);
		return {
			secret,
			otpAuthUrl
		}
	}

	public async qrCodeStreamPipe(stream: Response, otpPathUrl: string): Promise<any> {
		return toFileStream(stream, otpPathUrl);
	}

	public async activationOfTwoFa(user: User, status: boolean): Promise<void> {
		await this.userService.updateTwoFAUser(user, status);
	}

	public async verifyTwoFaCode(code: string, user: User): Promise<boolean> {
		return authenticator.verify({
			token: code,
			secret: user.twofasecret
		});
	}

	async signIn(user: User, response: Response): Promise<void> {
		console.log(user.email + " " + user.id + " " + user.twofasecret);
		const accessToken: string = (await this.authService.jwtGenerate(
			{
				email: user.email,
				id: user.id,
				isTwoFactorEnable: user.twofauser,
				isTwoFaAuthenticated: true
			}
		)).access_token;
		console.log(accessToken);
		response.cookie('access_token', accessToken, {
			httpOnly: true,
			path: '/',
			maxAge: 1000 * 60 * 60 * 20,
			sameSite: "strict",
			/* secure: true, -> only for localhost AND https */
		});
	}
}
