import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {

	@IsNotEmpty()
	login: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	refresh_token?: string;

	@IsNotEmpty()
	username: string;

	password?: string;

	salt?: string;

	fortytwouser?: boolean;

	playerid?: number;
}
