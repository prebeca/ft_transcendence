import { Injectable, Inject } from '@nestjs/common';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

const FormData = require('form-data');
const request = require('request');

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

  async getToken(code_api: string, state_api: string)/*: Promise<String>*/ {

    const formData = new FormData();

    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', process.env.APPLICATION_UID);
    formData.append('client_secret', process.env.APPLICATION_SECRET);
    formData.append('code', code_api);
    formData.append('redirect_uri', 'http://localhost:3000/auth/code');
    formData.append('state', state_api);

    const res = await axios.post('https://api.intra.42.fr/oauth/token',formData,{headers: formData.getHeaders()});

    console.log(res.data);

    request({
        url: 'https://api.intra.42.fr/v2/me',
        headers: {
          Authorization: 'Bearer ' + res.data.access_token,
        }
    },
    function(error, response, body) {
      console.log(body);
    });
  }
}
