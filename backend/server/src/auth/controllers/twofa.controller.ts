import { Body, ClassSerializerInterceptor, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { TwoFactorAuthService } from "../services/twofa.service";
import { Response } from 'express';
import { TwoFaAuthDto } from "../dto/twofa-auth.dto";

@ApiTags('Two FA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthService: TwoFactorAuthService
	) { }

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('generate-qr')
	async generateQrCode(
		@Res() response: Response, user: User
	) {
		const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(user);
		response.setHeader('content-type', 'image/png');
		return this.twoFactorAuthService.qrCodeStreamPipe(response, otpAuthUrl);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('turn-on-qr')
	async activationOfTwoFa(
		user: User,
		@Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto
	) {
		const isCodeValid = this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		await this.twoFactorAuthService.activationOfTwoFa(user, true);
	}

	// This function will be called if 2FA is on (activationOfTwoFa method)
	@ApiBearerAuth()
	@Post('authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(
		user: User,
		@Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto
	) {
		const isCodeValid = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		return await this.twoFactorAuthService.signIn(user, true);
	}
}