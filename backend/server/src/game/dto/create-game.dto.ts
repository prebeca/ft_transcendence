import { IsNumber, IsString } from "class-validator";

export class CreateGameDto {

	@IsNumber()
	difficulty: number;

	@IsNumber()
	points: number;

}
