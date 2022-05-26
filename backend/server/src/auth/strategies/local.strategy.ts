import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Body, Injectable, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginInterface } from '../interfaces/login.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email', passwordField: 'password' });
    }

    async validate(email: string, password: string): Promise<User> {
        const loginPayload: LoginInterface = { email, password };
        const user: User = { ... await this.authService.validateUser(loginPayload) };
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
