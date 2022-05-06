import { Injectable, Inject } from '@nestjs/common';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

const FormData = require('form-data');
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
    console.log("getToken = async");
    console.log("client_id = " + this.config.get<string>('APPLICATION_UID'));
    console.log("client_secret = " + this.config.get<string>('APPLICATION_SECRET'));
    console.log("code = " + code_api);
    console.log("state =" + state_api);
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', 'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1');
    formData.append('client_secret', 'f3962b175d760242e48a3654202bb03bbc1dc7efe904ae85c969f6fb19bd2ff6');
    formData.append('code', code_api);
    formData.append('redirect_uri', 'http://localhost:3000/auth/code');
    formData.append('state', state_api);
    
    /*const params = {
      grant_type: 'authorization_code',
      client_id: 'ded1c1648dc1695fc3426269408516c8d74bc4c0834510bc6608539ed52d81a1',
      client_secret: this.config.get<string>('APPLICATION_SECRET'),
      code: code_api,
      redirect_uri: 'http://localhost:8080/userpage',
      state: state_api,
    };*/

    let token : string;
    const res = await axios.post('https://api.intra.42.fr/oauth/token',formData,{headers: formData.getHeaders()})
      .then(function(response: AxiosResponse){
        console.log(response);
        console.log("access_token = " + response.data.access_token);
      }).catch(function (response) {
      //handle error
      console.log(response);
    });
   // console.log(res.data);
    /*  data: params,
      headers: {
        "Content-type": 'application/json',
      },
    }).then(function (response){
      token = response.data.access_token;
    }).catch(function (response) {
    //handle error
    console.log(response);
    });*/
		//return token;
  }
}