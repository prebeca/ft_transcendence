import { IsNumber } from "class-validator";

export class CreateGameDto {

	@IsNumber()
	difficulty: number;

}
