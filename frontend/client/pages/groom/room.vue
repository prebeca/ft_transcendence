<template>
  <div id="myGameRoom" width="100vw" height="100vh">
    <p>this is a room for a game to play with another player</p>
    <div v-for="user in users" :key="user.id">
      <p>Username of Player {{ user.id }} : {{ user.username }}</p>
      <v-avatar size="200px" tile class="mt-3">
        <img :src="user.avatar" alt="avatar" />
      </v-avatar>
    </div>
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
      counter: 0,
      player1: [],
      player2: [],
    };
  },
  created() {
    console.log("created");
    this.socket = io(process.env.API_SOCKET_GAMEROOM, {
      withCredentials: true,
    });
  },
  beforeMount() {
    console.log("beforeMount");
    this.socket.on("handshake", (data) => {
      console.log(data);
    });
    this.socket.on("infouserp1", (data) => {
      console.log(data);
      this.counter++;
      this.users.push({
        id: this.counter,
        avatar:
          `${process.env.API_URL}` + "/users/profile/avatar/" + data.avatar,
        username: data.username,
      });
      console.log(this.users[0]);
    });
    this.socket.on("infouserp2", (data) => {
      console.log(data);
      this.counter++;
      this.users.push({
        id: this.counter,
        avatar:
          `${process.env.API_URL}` + "/users/profile/avatar/" + data.avatar,
        username: data.username,
      });
      console.log(this.users[0]);
    });
  },
  mounted() {
    console.log("mouted");
    this.socket.emit("joinRoom", this.$route.query.name);
  },
});
</script>