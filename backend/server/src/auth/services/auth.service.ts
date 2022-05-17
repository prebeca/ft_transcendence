import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UserDto } from 'src/users/dto/users.dto';
import { FTUser } from '../interfaces/42User.interface';
import {User} from 'src/users/entities/user.entity';

const FormData = require('form-data');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private createUserDto: UserDto
  ) {}


	@Inject(ConfigService)
	private readonly config: ConfigService;

  async login(userlogin: string, userid: number) {
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
    this.createUserDto.username = res2.data.login;

    var user: User = await this.usersService.findOne(this.createUserDto.login);
    if (!user) {

      user = await this.usersService.createUser(this.createUserDto);
      if (user === null)
        return null;
    }
    const id = user.id;
    const result_jwtsign: any = await this.login(res2.data.login, id);
    return result_jwtsign.access_token;
  }

  async getToken(code_api: string, state_api: string) {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', this.config.get<string>('APPLICATION_UID'));
    formData.append('client_secret', this.config.get<string>('APPLICATION_SECRET'));
    formData.append('code', code_api);
    formData.append('redirect_uri', this.config.get<string>('BASE_URL') + '/auth/login');
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
