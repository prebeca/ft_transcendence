import {IsNotEmpty} from "class-validator";

export class CreateScoreDto {
	@IsNotEmpty()
	userid: number;

	@IsNotEmpty()
	points: number;

}