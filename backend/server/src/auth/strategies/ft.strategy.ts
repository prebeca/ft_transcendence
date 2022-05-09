import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FTUser } from '../interfaces/42User.interface';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('APPLICATION_UID'),
      clientSecret: configService.get<string>('APLICATION_SECRET'),
      callbackURL: configService.get<string>('http://localhost:3000/auth/login'),
      profileFields: {
        'id': function (obj) { return String(obj.id);},
        'username': 'login',
        'emails.0.value': 'email',
        'photos.0.value': 'image_url'
      }
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: FTUser,
  ): FTUser {
      return profile;
    };
}