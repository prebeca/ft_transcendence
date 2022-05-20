<template>
  <div>
    <div id="myGame">
      <canvas id="canvas"></canvas>
    </div>
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
      // game: {} as GameI,
      pad1: {} as PadI,
      pad2: {} as PadI,
      ball: {} as BallI,
    };
  },
  created() {
    this.socket = io(process.env.API_SOCKET_GAME);
    this.pad1.width = 10;
    this.pad1.height = 68;
    this.pad2.width = 10;
    this.pad2.height = 68;
  },
  beforeMount() {
    this.socket.on("print", (data) => {
      this.myPrint(data);
    });

    this.socket.on("drawPad", (nb: number, pady: number) => {
      this.drawPad(nb, pady);
    });
    this.socket.on("drawBall", (ballx: number, bally: number) => {
      console.log("dans socket " + ballx + "----" + bally)
      this.drawBall(ballx, bally);
    });
  },
  mounted() {
    this.setUpCanvas();
    this.play();

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        // this.socket.emit("ArrowUp", this.pad1.y);
        this.socket.emit("ArrowUp");
      }
      if (event.key === "ArrowDown") {
        // this.socket.emit("ArrowUp", this.pad1.y);
        this.socket.emit("ArrowDown");
      }
    });
  },
  methods: {
    setUpCanvas() {
      this.canvas = document.getElementById("canvas");
      if (!this.canvas) {
        return;
      }
      this.context = this.canvas.getContext("2d");
      this.canvas.width = window.innerWidth / 2;
      this.canvas.height = window.innerHeight / 2;
      this.pad1.x = 0;
      this.pad2.x = this.canvas.width - this.pad1.width;
      this.ball.r = 6;
      this.drawCanvas();
      this.socket.emit("initPads", {width: this.canvas.width, height: this.canvas.height});
    },
    play() {
      this.drawBall(this.ball.x + 1, this.ball.y + 1);
      requestAnimationFrame(this.play);
    },
    draw() {
      this.drawCanvas();
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
    drawPad(nb: number, pady: number) {
      let pad: PadI;
      if (nb === 1)
        pad = this.pad1;
      else pad = this.pad2;
      this.erasePad(pad, pady);
      pad.y = pady;
      this.context.fillStyle = "white";
      this.context.fillRect(pad.x, pad.y, pad.width, pad.height);
    },
    erasePad(pad: PadI, pady: number) {
      // this.context.clearRect(pad.x, pad.y - 1, pad.width, pad.height + 1);
      this.context.fillStyle = "black";
      this.context.fillRect(pad.x, pad.y - 1, pad.width, pad.height + 2);
    },
    drawBall(ballx: number, bally: number) {
      this.eraseBall(this.ball);
      this.context.beginPath();
      this.ball.x = ballx;
      this.ball.y = bally;
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
    eraseBall(ball) {
      this.context.beginPath();
      this.context.fillStyle = "black";
      this.context.arc(
        this.ball.x,
        this.ball.y,
        this.ball.r + 1,
        0,
        Math.PI * 2,
        false
      );
      this.context.fill();
      // this.context.clearRect(ball.x, ball.y, ball.r);
      // this.drawCanvas();
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
