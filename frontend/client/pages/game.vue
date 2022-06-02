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
import PadI from "../types/interfaces/padI.interface";
import BallI from "../types/interfaces/ballI.interface";

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
      pad1: {} as PadI,
      pad2: {} as PadI,
      ball: {} as BallI,
      // score1: {} as number,
      // score2: {} as number,
      // status: GameStatus.INCOMPLETE,
      ratiox: {} as number,
      ratioy: {} as number,
    };
  },
  created() {
		this.game.pad1 = {} as PadI;
		this.game.pad2 = {} as PadI;
		this.game.ball = {} as BallI;
    this.game.score1 = 0;
    this.game.score2 = 0;
    this.game.status = GameStatus.WAITING;
    this.socket = io(process.env.API_SOCKET_GAME, {withCredentials: true});
  },
  beforeMount() {
    this.socket.on("print", (data) => {
      this.myPrint(data);
    });
    this.socket.on("initDone", (data: GameI) => {
      this.update(data);
    });
    this.socket.on("updateGame", (data: GameI) => {
      this.update(data);
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

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.update);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
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
      this.canvas.width = window.innerWidth / 1.5;
      this.canvas.height = window.innerHeight / 1.5;
      this.ratiox = this.canvas.width / this.game.gameWidth;
      this.ratioy = this.canvas.height / this.game.gameHeight;
    },
    update(data: GameI) {
      this.game = data;
      this.handleResize();
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
    drawPads() {
      this.context.fillStyle = "white";
      this.context.fillRect(this.game.pad1.x * this.ratiox, this.game.pad1.y * this.ratioy, this.game.pad1.width * this.ratiox, this.game.pad1.height * this.ratioy);
      this.context.fillRect(this.game.pad2.x * this.ratiox, this.game.pad2.y * this.ratioy, this.game.pad2.width * this.ratiox, this.game.pad2.height * this.ratioy);
    },
    drawBall() {
      this.context.beginPath();
      this.context.fillStyle = "white";
      const { x, y, r } = this.game.ball;
      this.context.arc(x * this.ratiox, y * this.ratioy, r * this.ratiox * this.ratioy, 0, Math.PI * 2, false);
      this.context.fill();
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
    myPrint(data) {
      console.log(data);
    },
  },
});
</script>
