import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {

	@IsNotEmpty()
	login: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	access_token: string;

	refresh_token: string;
	
	scope: string;

	expires_in: number;
	
	created_at: number;

	@IsNotEmpty()
	username: string;
}
