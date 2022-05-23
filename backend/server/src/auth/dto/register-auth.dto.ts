import { IsString, IsEmail, IsNotEmpty } from "class-validator"

export class RegisterAuthDto {

	@IsNotEmpty()
	@IsString()
	username: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;
}
