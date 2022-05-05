import { Injectable, Inject } from '@nestjs/common';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService
  ) {}


	@Inject(ConfigService)
	private readonly config: ConfigService;

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
		console.log("validateUser() user.password === pass");
      const { password, ...result } = user;
      return result;
    }
		console.log("validateUser() user.password !== pass");
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getToken(code_api: string)//: Promise<AxiosResponse>
  {
    console.log("getToken = async");
    console.log("client_id = ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1");
    console.log("client_secret = " + this.config.get<string>('APPLICATION_SECRET'));
    console.log("code = " + code_api);
		firstValueFrom(this.httpService.post('https://api.intra.42.fr/oauth/token',
    {
        grant_type: 'client_credentials',
        client_id: 'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1',
        client_secret: this.config.get<string>('APPLICATION_SECRET'),
        code: code_api,
        redirect_uri: 'http://localhost:8080/userpage'
    }));
  }
}