import BallI from "./ballI.interface";
import PadI from "./padI.interface";

export default interface GameI {

	canvasWidth: number,
	canvasHeight: number,

	pad1: PadI,
	pad2: PadI,

	ball: BallI,

	ratiox: number,
	ratioy: number,

	score1: number,
	score2: number,

	status: string,

}
