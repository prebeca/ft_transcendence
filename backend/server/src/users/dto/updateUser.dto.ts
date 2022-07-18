import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {

	@IsNotEmpty()
	username?: string;

	avatar?: string;

	twofauser?: boolean;

	twofasecret?: string;

	refresh_token?: string;
}
