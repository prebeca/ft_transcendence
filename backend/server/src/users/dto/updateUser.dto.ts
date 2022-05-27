import { IsNotEmpty } from "class-validator";

export class UpdateUserDto {

	username?: string;

	avatar?: string;

	twofauser?: boolean;

	twofasecret?: string;
}
