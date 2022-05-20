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
import { defineComponent } from "vue";

export default Vue.extend({
  name: "Game",
  data() {
    return {
      socket: io(),
      canvas: {} as HTMLCanvasElement,
      context: {} as CanvasRenderingContext2D | null,
      pad1: {
        y: 0,
        width: 10,
        height: 100,
      },
      pad2: {
        y: 0,
        width: 10,
        height: 100,
      },
      ball: {
        x: 0,
        y: 0,
        r: 5,
        speed: 1,
      },
    };
  },
  created() {
    this.socket = io(process.env.API_SOCKET_GAME);
  },
  beforeMount() {
    this.socket.on("print", (data) => {
      this.myPrint(data);
    });

    this.socket.on("drawPad", (pad) => {
      this.drawPad(pad);
    });
  },
  mounted() {
    this.setUpCanvas();
    // this.ball.x += 2;
    // this.ball.y += 2;
    // this.draw();

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.socket.emit("ArrowUp");
      }
    });
  },
  methods: {
    setUpCanvas() {
      this.canvas = document.getElementById("canvas");
      if (!this.canvas) {
        console.log("canvas failed");
        return;
      }
      this.context = this.canvas.getContext("2d");
      this.canvas.width = window.innerWidth / 2;
      this.canvas.height = window.innerHeight / 2;
      this.drawCanvas();
      this.socket.emit("initPads", this.canvas.width, this.canvas.height);
      // this.pad1.y = this.canvas.height / 2 - this.pad1.height / 2;
      // this.pad2.y = this.canvas.height / 2 - this.pad2.height / 2;
      // this.ball.x = this.canvas.width / 2;
      // this.ball.y = this.canvas.height / 2;
      // this.socket.emit("setUpPads", this.canvas.width, this.canvas.height);
      // this.draw();
    },
    draw() {
      // this.drawCanvas();
      // this.context.clearRect(
      //   this.canvas.width + 5,
      //   this.canvas.height / 20,
      //   this.pad1.width,
      //   this.pad1.height
      // );
      // this.context.fillStyle = "white";
      // this.context.fillRect(0, this.pad1.y, this.pad1.width, this.pad1.height);
      // this.context.fillRect(
      //   this.canvas.width - this.pad2.width,
      //   this.pad2.y,
      //   this.pad2.width,
      //   this.pad2.height
      // );
      // this.context.beginPath();
      // this.context.fillStyle = "white";
      // this.context.arc(
      //   this.ball.x,
      //   this.ball.y,
      //   this.ball.r,
      //   0,
      //   Math.PI * 2,
      //   false
      // );
      // this.context.fill();
    },
    drawCanvas() {
      // Draw field
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // Draw middle line
      this.context.strokeStyle = "white";
      this.context.beginPath();
      this.context.moveTo(this.canvas.width / 2, 0);
      this.context.lineTo(this.canvas.width / 2, this.canvas.height);
      this.context.stroke();
    },
    drawPad(pad) {
      this.erasePad(this.pad);
      if (pad.x === 0) this.pad1 = pad;
      else this.pad2 = pad;
      if (pad.x === 0) console.log("laaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      this.context.fillStyle = "white";
      this.context.fillRect(pad.x, pad.y, pad.width, pad.height);
    },
    erasePad(pad) {
      this.context.clearRect(pad.x, pad.y, pad.width, pad.height);
    },
    drawBall(ball) {
      this.eraseball(ball);
      this.context.fillStyle = "white";
      this.context.arc(
        this.ball.x,
        this.ball.y,
        this.ball.r,
        0,
        Math.PI * 2,
        false
      );
    },
    eraseBall(ball) {
      this.context.clearRect(ball.x, ball.y, ball.r);
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
