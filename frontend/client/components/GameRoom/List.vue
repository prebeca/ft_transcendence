<template>
  <div>
    <li v-for="room in rooms" :key="room.roomname">
      <p>roomid : {{ room.roomname }}</p>
      <p>Player1 : {{ room.player1 }} || Player2 : {{ room.player2 }}</p>
      <v-avatar size="50px" class="m-10 mr-5">
        <img :src="room.avatar1" alt="avatar" />
      </v-avatar>
      <v-avatar size="50px" class="m-10 mr-5">
        <img :src="room.avatar2" alt="avatar" />
      </v-avatar>
      <v-btn color="success" class="mr-2" @click="join(room.roomname)">
        join
      </v-btn>
    </li>
  </div>
</template>

<style scoped>
li {
  margin-top: 10px;
}
</style>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      intervalID: {} as NodeJS.Timer,
      rooms: [
        {
          roomname: "",
          player1: "",
          avatar1: "",
          player2: "",
          avatar2: "",
        },
      ],
    };
  },
  created: async function () {
    await this.getList();
    this.intervalID = setInterval(this.getList, 1000);
  },
  beforeDestroy() {
    clearInterval(this.intervalID);
  },
  methods: {
    async getList() {
      var new_rooms = [
        { roomname: "", player1: "", avatar1: "", player2: "", avatar2: "" },
      ];
      await this.$axios
        .get("/gameroom/list")
        .then((res) => {
          console.log(res.data);
          var array: {
            roomname: string;
            player1: string;
            avatar1: string;
            player2: string;
            avatar2: string;
          }[];
          array = res.data;
          for (let i = 0; i < array.length; i++) {
            if (array[i].avatar1) {
              array[i].avatar1 =
                `${process.env.API_URL}/users/profile/avatar/` +
                array[i].avatar1;
            }
            if (array[i].avatar2) {
              array[i].avatar2 =
                `${process.env.API_URL}/users/profile/avatar/` +
                array[i].avatar2;
            }
            if (i === 0 && new_rooms[0].roomname === "") {
              new_rooms[0].roomname = array[i].roomname;
              new_rooms[0].player1 = array[i].player1;
              new_rooms[0].avatar1 = array[i].avatar1;
              new_rooms[0].player2 = array[i].player2;
              new_rooms[0].avatar2 = array[i].avatar2;
            } else {
              new_rooms.push({
                roomname: array[i].roomname,
                player1: array[i].player1,
                avatar1: array[i].avatar1,
                player2: array[i].player2,
                avatar2: array[i].avatar2,
              });
            }
          }
          this.rooms = new_rooms;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async join(name: string) {
      if (name === "") return;
      this.$router.push({ path: "/groom/room", query: { name: name } });
      console.log("does nothing" + name);
    },
  },
});
</script>
