import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtTwoFactorAuthGuard extends AuthGuard(['jwt-twofa', 'jwt-rt']) { }
