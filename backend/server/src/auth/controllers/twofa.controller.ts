import { Body, ClassSerializerInterceptor, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { Request, Response } from "express";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/services/users.service";
import { TwoFaAuthDto } from "../dto/twofa-auth.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { TwoFactorAuthService } from "../services/twofa.service";

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthService: TwoFactorAuthService,
		private readonly userService: UsersService
	) { }

	@UseGuards(JwtAuthGuard)
	@Post('generate-qr')
	async generateQrCode(
		@Res() response: Response, @Req() req: Request) {
		const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user as User);
		response.setHeader('content-type', 'image/png');
		return this.twoFactorAuthService.qrCodeStreamPipe(response, otpAuthUrl);
	}

	@UseGuards(JwtAuthGuard)
	@Post('turn-on-qr')
	async activationOfTwoFa(@Req() req: Request, @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto): Promise<boolean> {
		const userid: number = (req.user as User).id;
		const user = await this.userService.findUserbyIdWithSensibleData(userid);
		const isCodeValid: boolean = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		await this.twoFactorAuthService.activationOfTwoFa(user, true);
		return isCodeValid;
	}

	@Post('authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(@Res({ passthrough: true }) response: Response, @Req() req: Request, @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto): Promise<boolean> {
		const userid: number = (req.user as User).id;
		const user = await this.userService.findUserbyIdWithSensibleData(userid);
		const isCodeValid: boolean = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		await this.twoFactorAuthService.signIn(user, response);
		return isCodeValid;
	}
}
