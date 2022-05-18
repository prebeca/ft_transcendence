<template>
  <div class="GameArea">
    <canvas id="canvas" width="1600" height="1200"></canvas>
  </div>
</template>

<script lang="">
import Vue from "vue";
import io from "socket.io-client";

export default Vue.extend({
  name: "Game",
  data() {
    return {
      socket: {},
      context: {},
      position: {
        x: 0,
        y: 0,
      },
      canvas: {},
    };
  },
  created() {
    this.socket = io(process.env.API_SOCKET_GAME);
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    // // Draw field
    // this.context.fillStyle = "black";
    // this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // // Draw middle line
    // this.context.strokeStyle = "white";
    // this.context.beginPath();
    // this.context.moveTo(this.canvas.width / 2, 0);
    // this.context.lineTo(this.canvas.width / 2, this.canvas.height);
    // this.context.stroke();

    this.socket.on("position", (data) => {
      this.position = data;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillRect(this.position.x, this.position.y, 20, 20);
    });
  },
  methods: {
    move(direction) {
      this.socket.emit("move", direction);
    },
  },
});
</script>

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
