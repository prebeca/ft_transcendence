<template>
  <div id="myGameRoom" width="100vw" height="100vh">
    <div>
      <h2>{{ player1.username }}</h2>
      <v-avatar size="200px" tile class="mt-3">
        <img :src="player1.avatar" alt="avatar" />
      </v-avatar>
      <h3>
        Level {{ player1.level }} || {{ player1.wins }} wins /
        {{ player1.losses }} losses || {{ player1.mmr }} mmr
      </h3>
    </div>
    <div><h1>VS</h1></div>
    <div>
      <h2>{{ player2.username }}</h2>
      <v-avatar size="200px" tile class="mt-3">
        <img :src="player2.avatar" alt="avatar" />
      </v-avatar>
      <h3>
        Level {{ player2.level }} || {{ player2.wins }} wins /
        {{ player2.losses }} losses || {{ player2.mmr }} mmr
      </h3>
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
      roomid: "",
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
    this.socket.on("p1leaving", (data) => {
      console.log("p1leaving");
      this.player1 = {
        username: "",
        avatar: "",
        level: 0,
        mmr: 0,
        wins: 0,
        losses: 0,
      };
    });
    this.socket.on("p2leaving", (data) => {
      console.log("p2leaving");
      this.player2 = {
        username: "",
        avatar: "",
        level: 0,
        mmr: 0,
        wins: 0,
        losses: 0,
      };
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
    this.roomid = this.$route.query.name as string;
  },
  beforeDestroy() {
    console.log("BeforeDestruction: leaving room");
    console.log("roomid = " + this.roomid);
    this.socket.emit("leaveRoom", this.roomid);
  },
});
</script>