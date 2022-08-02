import { IsNumber, IsString } from "class-validator";

export class CreateGameDto {

	@IsString()
	difficulty: string;

	@IsNumber()
	points: number;

	@IsString()
	map: string;
}
