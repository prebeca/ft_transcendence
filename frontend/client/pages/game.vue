<template>
	<div id="myGame">
	  <canvas id="canvas"></canvas>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import io from "socket.io-client";
import PadI from "../types/interfaces/padI.interface"
import BallI from "../types/interfaces/ballI.interface"
import GameI from "../types/interfaces/gameI.interface"

export default Vue.extend({
  name: "Game",
  data() {
	return {
	  socket: io(),
	  canvas: {} as HTMLCanvasElement,
	  context: {} as CanvasRenderingContext2D | null,
	  game: {} as GameI,
	  pad1: {} as PadI,
	  pad2: {} as PadI,
	  ball: {} as BallI,
	};
  },
  created() {
	this.socket = io(process.env.API_SOCKET_GAME);
  },
  beforeMount() {
	this.socket.on("print", (data) => {
	  this.myPrint(data);
	});

	this.socket.on("initGame", (data: GameI) => {
	  this.initGame(data);
	});

	this.socket.on("updatePad", (data: number) => {
		this.game.pad1y = data;
		this.pad1.y = this.game.pad1y;
		this.drawPad(this.pad1);
	});
	this.socket.on("drawBall", (ballx: number, bally: number) => {
	  console.log("dans socket " + ballx + "----" + bally)
	  this.drawBall(ballx, bally);
	});
	this.socket.on("updateDimensions", (data: GameI) => {
	  this.initGame(data);
	});
  },
  mounted() {
	this.canvas = document.getElementById("canvas");
	if (!this.canvas) {
	  return;
	}
	this.context = this.canvas.getContext("2d");
	this.socket.emit('initGame', {width: window.innerWidth, height: window.innerHeight});

	this.play();

	window.addEventListener("keydown", (event) => {
	  if (event.key === "ArrowUp") {
		this.socket.emit("arrowUp");
	  }
	  if (event.key === "ArrowDown") {
		this.socket.emit("arrowDown");
	  }
	});

	const handleResize = (event) => {
		this.socket.emit('updateDimensions', {width: window.innerWidth, height: window.innerHeight});
	};

	window.addEventListener('resize', handleResize);

  },
  methods: {
	initGame(data: GameI) {
		this.game = data;
		this.canvas.width = data.canvasWidth;
		this.canvas.height = data.canvasHeight;
		this.pad1.width = this.game.pad1Width;
		this.pad1.height = this.game.pad1Height;
		this.pad1.speed = this.game.pad1Speed;
		this.pad2.width = this.game.pad2Width;
		this.pad2.height = this.game.pad2Height;
		this.pad2.speed = this.game.pad2Speed;
		this.pad1.x = this.game.pad1x;
		this.pad2.x = this.game.pad2x;
		// this.pad2.x = this.canvas.width - this.pad1.width;
		this.pad1.y = this.game.pad1y;
		this.pad2.y = this.game.pad2y;
		this.ball.x = this.game.ballx;
		this.ball.y = this.game.bally;
		this.ball.r = this.game.ballr;
		this.draw();
	},
	play() {
	//   this.drawBall(this.ball.x + 1, this.ball.y + 1);
		this.draw();
		requestAnimationFrame(this.play);
	},
	draw() {
		this.drawCanvas();
		this.drawPad(this.pad1);
		this.drawPad(this.pad2);
		this.drawBall();
		console.log("dans draw");
	},
	drawCanvas() {
	  this.context.fillStyle = "black";
	  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	  this.context.strokeStyle = "white";
	  this.context.beginPath();
	  this.context.moveTo(this.canvas.width / 2, 0);
	  this.context.lineTo(this.canvas.width / 2, this.canvas.height);
	  this.context.stroke();
	},
	drawPad(pad: PadI) {
		// this.erasePad(pad);
		this.context.fillStyle = "white";
		this.context.fillRect(pad.x, pad.y, pad.width, pad.height);
	},
	// erasePad(pad: PadI) {
	// 	this.context.fillRect(pad.x, pad.y - 1, pad.width, pad.height + 2);
	// },
	// drawPad(nb: number, pady: number) {
	//   let pad: PadI;
	//   if (nb === 1)
	// 	pad = this.pad1;
	//   else pad = this.pad2;
	//   this.erasePad(pad, pady);
	//   pad.y = pady;
	//   this.context.fillStyle = "white";
	//   this.context.fillRect(pad.x, pad.y, pad.width, pad.height);
	// },
	// erasePad(pad: PadI, pady: number) {
	//   // this.context.clearRect(pad.x, pad.y - 1, pad.width, pad.height + 1);
	//   this.context.fillStyle = "black";
	//   this.context.fillRect(pad.x, pad.y - 1, pad.width, pad.height + 2);
	// },

	drawBall() {
	  this.context.beginPath();
	  this.context.fillStyle = "white";
	  this.context.arc(
		this.ball.x,
		this.ball.y,
		this.ball.r,
		0,
		Math.PI * 2,
		false
	  );
	  this.context.fill();
	},
	// drawBall(ballx: number, bally: number) {
	//   this.eraseBall(this.ball);
	//   this.context.beginPath();
	//   this.ball.x = ballx;
	//   this.ball.y = bally;
	//   this.context.fillStyle = "white";
	//   this.context.arc(
	// 	this.ball.x,
	// 	this.ball.y,
	// 	this.ball.r,
	// 	0,
	// 	Math.PI * 2,
	// 	false
	//   );
	//   this.context.fill();
	// },
	// eraseBall(ball: BallI) {
	//   this.context.beginPath();
	//   this.context.fillStyle = "black";
	//   this.context.arc(
	// 	this.ball.x,
	// 	this.ball.y,
	// 	this.ball.r + 1,
	// 	0,
	// 	Math.PI * 2,
	// 	false
	//   );
	//   this.context.fill();
	//   // this.context.clearRect(ball.x, ball.y, ball.r);
	//   // this.drawCanvas();
	// },

	myPrint(data) {
	  console.log(data);
	},
  },
});
</script>

<!--<style scoped>
#canvas {
  border: solid 2px white;
}
#myGame {
  background-color: black;
  width: 100vw;
  height: 100vh;
  padding: 5vh;
  /* display: flex; */
  /* flex-direction: */
}
.score {
  color: white;
  font-size: 3em;
}
img {
  width: 50px;
  display: inline;
}
</style>-->

<!--<script lang="ts">


import Vue from 'vue'
import socket from 'socket.io'
import io from 'socket.io-client'

export default Vue.extend({
	data() {
		return {
			title: 'Websockets Tester',
			text: '',
			messages: ['Some message', 'Another message'],
			socket: null,
		}
	},
	methods: {
		sendMessage() {
			// this.messages.push(this.text);
			console.log(`send: ${this.text}`);
			this.socket.emit('msgToServer', this.text);
			this.text = '';
		},
		receiveMessage(msg) {
			console.log(`recv: ${msg}`);
			this.messages.push(msg);
			// this.text = '';
		},
	},
	created() {
		this.socket = io(process.env.API_SOCKET_GAME);
		this.socket.on('msgToClient', (msg) => {
			this.receiveMessage(msg);
		});
	}
})


</script>-->
