export default interface GameI {

	canvasWidth: number,
	canvasHeight: number,

	pad1x: number,
	pad1y: number,
	pad1Width: number,
	pad1Height: number,
	pad1Speed: number,

	pad2x: number,
	pad2y: number,
	pad2Width: number,
	pad2Height: number,
	pad2Speed: number,

	ballx: number,
	bally: number,
	ballr: number,
	ballDir: {
		x: number,
		y: number,
	},
	ballSpeed: number,

	ratiox: number,
	ratioy: number,

	score1: number,
	score2: number,

	status: string,

}
