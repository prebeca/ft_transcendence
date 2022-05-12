import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {

	@IsNotEmpty()
	login: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	access_token: string;

	@IsNotEmpty()
	refresh_token: string;
	
	@IsNotEmpty()
	scope: string;

	@IsNotEmpty()
	expires_in: number;
	
	@IsNotEmpty()
	created_at: number;

	@IsNotEmpty()
	image_url: string;

	@IsNotEmpty()
	username: string;
}
