import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { StrategyOptionsWithRequest } from 'passport-google-oauth20';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({usernameField: 'email'});
  }

  async validate(username: string, email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}