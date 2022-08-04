import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {

	login?: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	refresh_token?: string;

	username?: string;

	password?: string;

	salt?: string;

	fortytwouser?: boolean;

	playerid?: number;
}
