import { Body, ClassSerializerInterceptor, Controller, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { User } from "src/users/entities/user.entity";
import { TwoFactorAuthService } from "../services/twofa.service";
import { TwoFaAuthDto } from "../dto/twofa-auth.dto";
import { Request, Response } from "express";

@ApiTags('Two FA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
	constructor(
		private readonly twoFactorAuthService: TwoFactorAuthService
	) { }

	@UseGuards(JwtAuthGuard)
	@Post('generate-qr') //generate the qr code on checking the box and clicking on validate (does not update the boolean yet)
	async generateQrCode(
		@Res() response: Response, @Req() req: Request) {
		const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user as User);
		response.setHeader('content-type', 'image/png');
		return this.twoFactorAuthService.qrCodeStreamPipe(response, otpAuthUrl);
	}

	@UseGuards(JwtAuthGuard)
	@Post('turn-on-qr') //verify the code entered by the user in the form after scanning the qr code
	async activationOfTwoFa(@Req() req: Request, @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto): Promise<boolean> {
		const user: User = { ... (req.user as User) };
		const isCodeValid: boolean = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		await this.twoFactorAuthService.activationOfTwoFa(user, true);
		return isCodeValid;
	}

	// This function will be called if 2FA is on (activationOfTwoFa method) (HOW ?)
	@Post('authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(@Res({ passthrough: true }) response: Response, @Req() req: Request, @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto): Promise<boolean> {
		const user: User = { ... (req.user as User) };
		console.log(user);
		const isCodeValid: boolean = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user);
		if (!isCodeValid) {
			throw new UnauthorizedException('Invalid authentication code');
		}
		console.log("code valid");
		await this.twoFactorAuthService.signIn(user, true, response);
		return isCodeValid;
	}
}