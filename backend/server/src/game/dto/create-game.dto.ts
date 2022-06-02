import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateGameDto {

	@IsString()
	name: string;

	@IsNumber()
	difficulty: number;

}
