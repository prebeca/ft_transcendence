<template>

  <div style="height: 80vh; max-height: 100%;" class="d-flex flex-column justify-center align-center">

      <v-card class="d-flex flex-column justify-center align-center" color="secondary" width="70%" height="10%" >
        <td> {{ game.score1 }} </td>
        <td> {{ game.score2 }} </td>
      </v-card>
      <div id="myGame" width="100vw" height="100vh">
        <canvas id="canvas"></canvas>
      </div>

  </div>

</template>

<script lang="ts">
import Vue from "vue";
import io from "socket.io-client";
import GameI from "../types/interfaces/gameI.interface";

export enum GameStatus {
  WAITING = "waiting",
  INCOMPLETE = "incomplete",
  INPROGRESS = "in progress",
  PLAYER1WON = "player 1 won",
  PLAYER2WON = "player 2 won",
	ENDED = "ended",
}

export default Vue.extend({
  name: "Game",
  data() {
    return {
      socket: io(),
      canvas: {} as HTMLCanvasElement,
      context: {} as CanvasRenderingContext2D | null,
      game: {} as GameI,
      // score1: {} as number,
      // score2: {} as number,
      // status: GameStatus.INCOMPLETE,
    };
  },
  created() {
    this.socket = io(process.env.API_SOCKET_GAME, {withCredentials: true});
  },
  beforeMount() {
    this.socket.on("print", (data) => {
      this.myPrint(data);
    });
    this.socket.on("initGame", (data: GameI) => {
      this.updateState(data);
    });
    this.socket.on("updateGame", (data: GameI) => {
      this.updateState(data);
    });
    this.socket.on("end", (data: GameI) => {
      this.endGame(data);
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

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.stop();
  },
  methods: {
    handleKeyDown: function(event) {
      if (event.key === "ArrowUp")
        this.socket.emit("arrowUp", this.game);
      if (event.key === "ArrowDown")
        this.socket.emit("arrowDown", this.game);
      if (event.key === "Escape")
        this.stop();
      if (event.key === "Enter")
        this.rePlay();
    },
    handleResize() {
      this.socket.emit("updateDimensions", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },
    updateState(data: GameI) {
      this.game = data;
      this.canvas.width = data.canvasWidth;
      this.canvas.height = data.canvasHeight;
      // this.score1 = this.game.score1;
      // this.score2 = this.game.score2;
      // this.status = this.game.status;
      this.draw();
    },
    stop() {
      this.status = GameStatus.ENDED;
      this.socket.emit("stopGame");
    },
    rePlay() {
      this.game.status = GameStatus.INPROGRESS;
      this.status = this.game.status;
      this.play();
    },
    draw() {
      // this.context.font = '100px Courier New';
      // this.context.textAlign = 'center';
      console.log("dans draw")
      this.clearScreen();
      this.drawCanvas();
      this.drawPads();
      this.drawBall();
      if (this.game.status != GameStatus.INPROGRESS && this.game.status != GameStatus.WAITING)
        this.endGame(this.game);
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
    endGame(game: GameI) {
      const winner = game.status;
      this.context.fillStyle = "white";
      this.context.font = (this.canvas.width / 10).toString() + "px serif";
      this.context.textAlign = "center";
      this.context.fillText(
        winner,
        this.canvas.width / 2,
        this.canvas.height / 4,
      );
    },
    drawPads() {
      this.context.fillStyle = "white";
      this.context.fillRect(this.game.pad1.x, this.game.pad1.y, this.game.pad1.width, this.game.pad1.height);
      this.context.fillRect(this.game.pad2.x, this.game.pad2.y, this.game.pad2.width, this.game.pad2.height);
    },
    drawBall() {
      this.context.beginPath();
      this.context.fillStyle = "white";
      const { x, y, r } = this.game.ball;
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
