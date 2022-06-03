import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateGameDto {

	@IsNumber()
	difficulty: number;

}
