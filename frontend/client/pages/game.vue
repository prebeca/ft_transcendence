<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-card
      class="d-flex justify-space-around align-center mb-3"
      color="secondary"
      width="80%"
      height="15%"
    >
      <v-card
        class="d-flex justify-center align-center"
        width="90px"
        height="90px"
        color="primary"
      >
        <h1>{{ game.score1 }}</h1>
      </v-card>
      <v-card
        class="d-flex justify-center align-center"
        width="90px"
        height="90px"
        color="primary"
      >
        <h1>{{ game.score2 }}</h1>
      </v-card>
    </v-card>
    <div id="myGame" width="100vw" height="100vh">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import type { NuxtSocket } from "nuxt-socket-io";
import Vue from "vue";
import GameI from "../types/interfaces/gameI.interface";
import PadI from "../types/interfaces/padI.interface";
import BallI from "../types/interfaces/ballI.interface";

export enum GameStatus {
  WAITING = "waiting",
  INCOMPLETE = "incomplete",
  INPROGRESS = "in progress",
  PLAYER1WON = "player 1 won",
  PLAYER2WON = "player 2 won",
  PLAYER1LEAVE = "player 2 won by forfeit",
  PLAYER2LEAVE = "player 1 won by forfeit",
  ENDED = "ended",
}

export default Vue.extend({
  name: "Game",
  data() {
    return {
      socket: this.$nuxtSocket({
        name: "gameroom",
        withCredentials: true,
        persist: "myGameSocket",
      }),
      canvas: {} as HTMLCanvasElement,
      context: {} as CanvasRenderingContext2D,
      roomid: "",
      game: {} as GameI,
      ratiox: {} as number,
      ratioy: {} as number,
    };
  },
  created() {
    this.game.status = GameStatus.WAITING;
  },
  beforeMount() {
    this.socket.on("noGame", (data) => {
      this.$router.push("/groom/selection");
    });
    this.socket.on("initDone", (data: GameI) => {
      this.update(data);
    });
    this.socket.on("updateGame", (data: GameI) => {
      this.update(data);
    });
    this.socket.on("updateStatus", (data: GameStatus) => {
      this.game.status = data;
      this.handleResize();
    });
    this.socket.on("endGame", (data: GameI) => {
      this.endGame(data);
    });
  },
  mounted() {
    this.roomid = this.$route.query.roomid as string;
    this.socket.emit("joinGame", this.roomid);
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!this.canvas) {
      return;
    }
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
  },
  destroyed() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
    this.socket.emit("leaveGame", this.roomid);
  },
  methods: {
    handleKeyDown: function (event: any) {
      console.log("roomid = " + this.roomid);
      if (event.key === "ArrowUp")
        this.socket.emit("arrowUp", { data: this.game, id: this.roomid });
      if (event.key === "ArrowDown")
        this.socket.emit("arrowDown", { data: this.game, id: this.roomid });
    },
    handleResize() {
      this.canvas.width = window.innerWidth / 1.5;
      this.canvas.height = window.innerHeight / 1.5;
      this.ratiox = this.canvas.width / this.game.gameWidth;
      this.ratioy = this.canvas.height / this.game.gameHeight;
      this.draw();
    },
    update(data: GameI) {
      this.game = data;
      this.handleResize();
    },
    draw() {
      this.clearScreen();
      this.drawCanvas();
      this.drawPads();
      this.drawBall();
      // if (
      //   this.game.status != GameStatus.INPROGRESS &&
      //   this.game.status != GameStatus.WAITING
      // )
      //   this.endGame(this.game);
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
      this.context.fillRect(
        this.game.pad1.x * this.ratiox,
        this.game.pad1.y * this.ratioy,
        this.game.pad1.width * this.ratiox,
        this.game.pad1.height * this.ratioy
      );
      this.context.fillRect(
        this.game.pad2.x * this.ratiox,
        this.game.pad2.y * this.ratioy,
        this.game.pad2.width * this.ratiox,
        this.game.pad2.height * this.ratioy
      );
    },
    drawBall() {
      this.context.beginPath();
      this.context.fillStyle = "white";
      const { x, y, r } = this.game.ball;
      this.context.arc(
        x * this.ratiox,
        y * this.ratioy,
        r * this.ratiox * this.ratioy,
        0,
        Math.PI * 2,
        false
      );
      this.context.fill();
    },
    endGame(game: GameI) {
      this.$router.push("/groom/score");
    },
  },
});
</script>
