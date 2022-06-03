<template>
  <div
    id="myGameRoom"
    style="height: 80vh; max-height: 100%; column-gap: 20px"
    class="d-flex justify-center align-center"
  >
    <GameRoomPlayerCard v-if="player1.username.length > 0" player="player1" />
    <GameRoomWaitingCard v-else />
    <h1>VS</h1>
    <GameRoomPlayerCard v-if="player2.username.length > 0" player="player2" />
    <GameRoomWaitingCard v-else />
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
      player1: {
        username: "",
        avatar: "",
        level: 0,
        mmr: 0,
        wins: 0,
        losses: 0,
      },
      player2: {
        username: "",
        avatar: "",
        level: 0,
        mmr: 0,
        wins: 0,
        losses: 0,
      },
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
      this.player1 = {
        ...this.player1,
        username: data.username,
        avatar:
          `${process.env.API_URL}` + "/users/profile/avatar/" + data.avatar,
        wins: data.wins,
        losses: data.losses,
        level: data.level,
        mmr: data.mmr,
      };
      console.log(this.player1);
    });
    this.socket.on("infouserp2", (data) => {
      console.log(data);
      this.counter++;
      this.player2 = {
        ...this.player2,
        username: data.username,
        avatar:
          `${process.env.API_URL}` + "/users/profile/avatar/" + data.avatar,
        wins: data.wins,
        losses: data.losses,
        level: data.level,
        mmr: data.mmr,
      };
    });
  },
  mounted() {
    console.log("mouted");
    this.socket.emit("joinRoom", this.$route.query.name);
  },
});
</script>