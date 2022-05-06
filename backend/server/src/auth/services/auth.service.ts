import { Injectable, Inject } from '@nestjs/common';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import { response } from 'express';

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
    formData.append('client_id', this.config.get<string>('APPLICATION_UID'));
    formData.append('client_secret', this.config.get<string>('APPLICATION_SECRET'));
    formData.append('code', code_api);
    formData.append('redirect_uri', 'http://localhost:3000/auth/code');
    formData.append('state', state_api);

    let access_token: string;
    const res = await axios.post('https://api.intra.42.fr/oauth/token',formData,{headers: formData.getHeaders()})
      .then(function(response: AxiosResponse){
        access_token = response.data.access_token;
      }).catch(function (response) {
    });
    const config: AxiosRequestConfig= {
      method: 'get',
      url: 'https://api.intra.42.fr/v2/me',
      headers: { 'Authorization': 'Bearer ' + access_token},
    }
    const res2 = await axios(config)
    .then(function(response: AxiosResponse){
      console.log(response.data);
    });
  }
}
