import BallI from "./ballI.interface";
import PadI from "./padI.interface";

export default interface GameI {

	gameWidth: number,
	gameHeight: number,

	pad1: PadI,
	pad2: PadI,

	ball: BallI,

	score1: number,
	score2: number,

	looserPoint: string,

	status: string,
}
