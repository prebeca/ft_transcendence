import { IsNotEmpty } from "class-validator";

export class CreateMessageDto {
	@IsNotEmpty()
	target_id: number;

	@IsNotEmpty()
	content: string;
}
