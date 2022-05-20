import PadI from "./padI.interface";
import BallI from "./ballI.interface";

export default interface GameI {
	pad1: PadI,
	pad2: PadI,
	ball: BallI,
}
