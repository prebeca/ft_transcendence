<template>
  <div style="width: 100%; height: 100%">
    <v-toolbar color="primary" height="12px" flat>
      <template v-slot:extension>
        <v-tabs v-model="tabs" color="info" fixed-tabs>
          <v-tab v-for="n in 2" :key="n" class="font-weight-bold">
            {{ tab[n - 1] }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <v-card flat color="secondary" class="py-10">
          <v-simple-table class="secondary">
            <template v-slot:default>
              <v-row class="mx-1">
                <v-col
                  v-for="room in rooms"
                  :key="room.roomname"
                  class="d-flex align-content-space-around justify-space-around"
                  cols="4"
                >
                  <div v-if="!room.player1 || !room.player2">
                    <div
                      v-if="room.player1 && !room.player2"
                      class="d-flex flex-column align-center"
                    >
                      <v-avatar size="100">
                        <img alt="friend-avatar" :src="room.avatar1" />
                      </v-avatar>
                      <h3 class="mt-1 info--text">
                        {{ room.player1 }}
                      </h3>
                      <v-btn text color="accent" @click="join(room.roomname)">
                        join
                      </v-btn>
                    </div>

                    <div
                      v-if="!room.player1 && room.player2"
                      class="d-flex flex-column align-center"
                    >
                      <v-avatar size="100">
                        <img alt="friend-avatar" :src="room.avatar2" />
                      </v-avatar>
                      <h3 class="mt-1 info--text">
                        {{ room.player2 }}
                      </h3>
                      <v-btn text color="accent" @click="join(room.roomname)">
                        join
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-simple-table>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat color="secondary" class="py-10">
          <v-simple-table class="secondary">
            <template v-slot:default>
              <v-row class="mx-1">
                <v-col
                  v-for="room in rooms"
                  :key="room.roomname"
                  class="d-flex align-content-space-around justify-space-around"
                  cols="4"
                >
                  <div
                    v-if="room.player1 && room.player2"
                    class="d-flex flex-column align-center"
                  >
                    <div class="d-flex align-center">
                      <div class="d-flex flex-column align-center">
                        <v-avatar size="80">
                          <img alt="friend-avatar" :src="room.avatar1" />
                        </v-avatar>
                        <h4 class="mt-1 info--text">
                          {{ room.player1 }}
                        </h4>
                      </div>

                      <h3 class="info--text">VS</h3>

                      <div class="d-flex flex-column align-center">
                        <v-avatar size="80">
                          <img alt="friend-avatar" :src="room.avatar2" />
                        </v-avatar>
                        <h4 class="mt-1 info--text">
                          {{ room.player2 }}
                        </h4>
                      </div>
                    </div>

                    <v-btn text color="accent" @click="join(room.roomname)">
                      join
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </template>
          </v-simple-table>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<style scoped>
.v-window {
  background-color: rgb(81, 45, 168) !important;
}
</style>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      intervalID: {} as NodeJS.Timer,
      tabs: null,
      tab: ["Play a game", "Watch a game"],
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
    },
  },
});
</script>
