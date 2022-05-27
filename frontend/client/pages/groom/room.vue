<template>
  <div id="myGameRoom" width="100vw" height="100vh">
    <p>this is a room for a game to play with another player</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import io from "socket.io-client";

export default Vue.extend({
  name: "GameRoom",
  data() {
    return {
      socket: io(),
    };
  },
  created() {
    console.log("created");
    this.socket = io(process.env.API_SOCKET_GAMEROOM);
  },
  beforeMount() {
    console.log("beforeMount");
    this.socket.on("handshake", (data) => {
      console.log(data);
      console.log("lol again");
    });
  },
  mounted() {
    console.log("mouted");
    this.socket.emit("createRoom", this.$route.query.name);
  },
});
</script>