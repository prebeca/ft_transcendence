<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <li v-for="room in rooms" :key="room.roomname">
      <p>roomid : {{ room.roomname }}</p>
      <p>Player1 : {{ room.player1 }} || Player2 : {{ room.player2 }}</p>
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
          player2: "",
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
      var new_rooms = [{ roomname: "", player1: "", player2: "" }];
      await this.$axios
        .get("/gameroom/list")
        .then((res) => {
          console.log(res.data);
          var array: { roomname: string; player1: string; player2: string }[];
          array = res.data;
          for (let i = 0; i < array.length; i++) {
            if (i === 0 && new_rooms[0].roomname === "") {
              new_rooms[0].roomname = array[i].roomname;
              new_rooms[0].player1 = array[i].player1;
              new_rooms[0].player2 = array[i].player2;
            } else {
              new_rooms.push({
                roomname: array[i].roomname,
                player1: array[i].player1,
                player2: array[i].player2,
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
