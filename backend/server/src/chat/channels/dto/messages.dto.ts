import { IsNotEmpty } from "class-validator";

export class CreateMessageDto {
	@IsNotEmpty()
	user_id: number;

	@IsNotEmpty()
	channel: string;

	@IsNotEmpty()
	content: string;
}
