<template>
  <div id="myGame" width="100vw" height="100vh">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import io from "socket.io-client";
import PadI from "../types/interfaces/padI.interface";
import BallI from "../types/interfaces/ballI.interface";
import GameI from "../types/interfaces/gameI.interface";

export enum GameStatus {
  WAITING = "waiting",
  INCOMPLETE = "incomplete",
  INPROGRESS = "in progress",
  PLAYER1WON = "player 1 won",
  PLAYER2WON = "player 2 won",
}

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
      score1: {} as number,
      score2: {} as number,
      status: GameStatus.INCOMPLETE,
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
      this.updateState(data);
    });
    this.socket.on("startGame", (data: GameI) => {
      this.updateState(data);
      this.socket.emit("startGame");
    })
    this.socket.on("updateGame", (data: GameI) => {
      this.updateState(data);
    });
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    if (!this.canvas) {
      return;
    }
    this.context = this.canvas.getContext("2d");
    this.socket.emit("initGame", {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.play();

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.socket.emit("arrowUp", this.game);
      }
      if (event.key === "ArrowDown") {
        this.socket.emit("arrowDown", this.game);
      }
      if (event.key === "Escape") {
        this.stop();
      }
      if (event.key === "Enter") {
        this.rePlay();
      }
    });

    const handleResize = (event) => {
      this.socket.emit("updateDimensions", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
  },
  methods: {
    updateState(data: GameI) {
      this.game = data;
      this.canvas.width = data.canvasWidth;
      this.canvas.height = data.canvasHeight;
      this.pad1.x = this.game.pad1x;
      this.pad1.y = this.game.pad1y;
      this.pad1.width = this.game.pad1Width;
      this.pad1.height = this.game.pad1Height;
      this.pad1.speed = this.game.pad1Speed;
      this.pad2.x = this.game.pad2x;
      this.pad2.y = this.game.pad2y;
      this.pad2.width = this.game.pad2Width;
      this.pad2.height = this.game.pad2Height;
      this.pad2.speed = this.game.pad2Speed;
      this.ball.x = this.game.ballx;
      this.ball.y = this.game.bally;
      this.ball.r = this.game.ballr;
      this.score1 = this.game.score1;
      this.score2 = this.game.score2;
      this.status = this.game.status;
    },
    play() {
      this.draw();
      requestAnimationFrame(this.play);
    },
    stop() {
      // console.log("dans stop");
      // this.status = GameStatus.WAITING;
      // this.socket.emit("stopGame");
    },
    rePlay() {
      this.status = GameStatus.INPROGRESS;
      this.play();
    },
    draw() {
      // this.context.font = '100px Courier New';
      // this.context.textAlign = 'center';
      this.clearScreen();
      this.drawCanvas();
      this.drawScore();
      this.drawPad(this.pad1);
      this.drawPad(this.pad2);
      this.drawBall();
    },
    clearScreen() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    drawScore() {
      this.context.fillStyle = "white";
      this.context.fillText(
        this.score1.toString(),
        this.canvas.width / 2 - 50,
        200
      );
      this.context.fillText(
        this.score2.toString(),
        this.canvas.width / 2 + 50,
        200
      );
    },
    drawPad(pad: PadI) {
      this.context.fillStyle = "white";
      this.context.fillRect(pad.x, pad.y, pad.width, pad.height);
    },
    drawBall() {
      this.context.beginPath();
      this.context.fillStyle = "white";
      const { x, y, r } = this.ball;
      this.context.arc(x, y, r, 0, Math.PI * 2, false);
      this.context.fill();
    },
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
