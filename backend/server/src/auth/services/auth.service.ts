import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CreateUserDto } from 'src/users/dto/users.dto';

const FormData = require('form-data');


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private createUserDto: CreateUserDto
  ) {}

	@Inject(ConfigService)
	private readonly config: ConfigService;

  async login(userlogin: string, userid: string) {
    const payload = { username: userlogin, sub: userid };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserInfos(access_token: string): Promise<string> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: 'https://api.intra.42.fr/v2/me',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
    }
    let res2: AxiosResponse;
    await axios(config)
    .then(function(response: AxiosResponse){
      res2 = response;
    })
    .catch(function (response) {
       console.log("Error =>" + response);
    });
    this.createUserDto.login = res2.data.login;
    this.createUserDto.email = res2.data.email;
    this.createUserDto.image_url = res2.data.image_url;
    this.createUserDto.username = res2.data.login; //TODO warning if other user change his username to someone else login

    const user = await this.usersService.findOne(this.createUserDto.login);
    if (!user) {
      const result_create = await this.usersService.createUser(this.createUserDto);
      if (result_create === null)
        return null;
    }
    const result_jwtsign: any = await this.login(res2.data.login, res2.data.id);
    return result_jwtsign.access_token;
  }

  async getToken(code_api: string, state_api: string) {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', this.config.get<string>('APPLICATION_UID'));
    formData.append('client_secret', this.config.get<string>('APPLICATION_SECRET'));
    formData.append('code', code_api);
    formData.append('redirect_uri', 'http://localhost:3000/auth/login');
    formData.append('state', state_api);

    let access_token: string;
    let res: AxiosResponse;
    await axios.post('https://api.intra.42.fr/oauth/token',formData,{headers: formData.getHeaders()})
      .then(function(response: AxiosResponse){
        res = response;
      }).catch(function (response) {
        console.log("Error =>" + response);
    });

    access_token = res.data.access_token;
    this.createUserDto.access_token = res.data.access_token;
    this.createUserDto.refresh_token = res.data.refresh_token;
    this.createUserDto.scope = res.data.scope;
    this.createUserDto.created_at = res.data.created_at;
    this.createUserDto.expires_in = res.data.expires_in;
    return this.getUserInfos(access_token);

  }
}
