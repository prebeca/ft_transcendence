import { IsNotEmpty } from "class-validator";

export class CreateMessageDto {
	@IsNotEmpty()
	channel_id: number;

	@IsNotEmpty()
	content: string;
}
