<template>
  <div style="height: 100vh; max-height: 100%" class="d-flex justify-center">
    <v-card color="secondary" class="mt-15" width="1000px" height="400px">
      <div class="d-block-flex">
        <div class="d-inline-flex">
          <v-card
            color="secondary"
            width="230px"
            height="320px"
            class="d-flex flex-column align-center justify-center"
            outlined
          >
            <v-avatar size="200px" tile class="mt-3">
              <img :src="user.avatar" alt="avatar" />
            </v-avatar>

            <v-card-actions v-if="!isUser">
              <div class="pt-2">
                <div>
                  <v-btn
                    color="success"
                    width="200px"
                    v-if="!isFriend"
                    @click="addFriend"
                  >
                    Add Friend
                  </v-btn>
                  <v-btn
                    v-else
                    color="primary"
                    width="200px"
                    @click="removeFriend"
                  >
                    Remove Friend
                  </v-btn>
                </div>

                <div class="pt-2">
                  <v-btn
                    color="accent"
                    width="200px"
                    v-if="!isBlocked"
                    @click="block"
                  >
                    Block User
                  </v-btn>
                  <v-btn color="primary" width="200px" v-else @click="unblock">
                    Unblock User
                  </v-btn>
                </div>
              </div>
            </v-card-actions>

            <v-card-actions v-else>
              <v-btn to="/user/edit" color="primary" width="200px">
                EDIT YOUR PROFILE
              </v-btn>
            </v-card-actions>
          </v-card>
          <UserInfoCard :user="user" :player="user.player" />
        </div>
        <v-card class="mx-auto" color="secondary" height="100px" outlined>
          <v-toolbar color="primary" height="15px" flat>
            <template v-slot:extension>
              <v-tabs v-model="tabs" centered color="info">
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
                    <tbody v-if="user_matches.length > 0">
                      <tr
                        v-for="match in user_matches"
                        :key="match.id"
                        class="row-color"
                      >
                        <UserMatchItem
                          v-if="match.winner.id === user.id"
                          :player1_score="match.score_winner"
                          :player2_score="match.score_looser"
                          :player1_username="user.username"
                          :player2_username="match.username_looser"
                          :date="match.date"
                        />
                        <UserMatchItem
                          v-else
                          :player1_score="match.score_looser"
                          :player2_score="match.score_winner"
                          :player1_username="user.username"
                          :player2_username="match.username_winner"
                          :date="match.date"
                        />
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card>
            </v-tab-item>

            <v-tab-item color="secondary">
              <v-card flat color="secondary">
                <v-simple-table class="secondary">
                  <template v-slot:default>
                    <v-row class="my-10 mx-2">
                      <v-col
                        v-for="(friend, index) in user.friends"
                        :key="index"
                        class="d-flex align-content-space-around justify-space-around"
                        cols="4"
                      >
                        <UserFriendCard :friend="friend" />
                      </v-col>
                    </v-row>
                  </template>
                </v-simple-table>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      currentUser: {
        id: "",
        blocked: [] as any,
        friends: [
          {
            id: "",
          },
        ],
      },
      user: {
        avatar: "",
        player: {},
        friends: [],
        id: "",
        username: "",
      },
      isUser: false,
      isFriend: false,
      isBlocked: false,
      tabs: null,
      tab: ["Match History", "Friends List"],
      user_matches: [
        {
          winner: {
            id: "",
          },
          looser: {
            id: "",
          },
          id: "",
          username_winner: "",
          username_looser: "",
          score_winner: 0,
          score_looser: 0,
          date: "",
        },
      ],
    };
  },
  async mounted() {
    await this.getCurrentUser();
    this.getUser(this.$route.params.users);
  },
  watch: {
    "$route.params.users"(newid: string, oldid: string) {
      this.getCurrentUser();
      this.getUser(newid);
    },
  },
  methods: {
    async getCurrentUser() {
      await this.$axios
        .get("/users/profile")
        .then((res: any) => {
          this.currentUser = res.data;
        })
        .catch((error: any) => {});
    },
    getUser(id: string) {
      this.$axios
        .get("/users/u/" + this.$route.params.users)
        .then((res: any) => {
          this.user = res.data;
          if (this.user !== null) {
            if (this.currentUser.id === this.user.id) {
              this.isUser = true;
              this.isFriend = false;
              this.isBlocked = false;
            } else this.changeButtonData(this.user.id);
            this.changeAvatar(this.user.avatar);
            this.getMatchHistory(this.user.id);
          }
        })
        .catch((error: any) => {
          console.error(error);
        });
    },
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
    changeButtonData(user_id: string) {
      this.isUser = false;
      if (
        this.currentUser.friends.find((e) => {
          return e.id == user_id;
        })
      )
        this.isFriend = true;
      if (this.currentUser.blocked !== undefined) {
        if (
          this.currentUser.blocked.find((e: any) => {
            return e.id == user_id;
          }) != undefined
        )
          this.isBlocked = true;
      }
    },
    getMatchHistory(user_id: string) {
      this.$axios
        .get("/gameroom/history/" + user_id)
        .then((res: any) => {
          this.user_matches = res.data;
        })
        .catch((error: any) => {
          console.error(error);
        });
    },
    async block() {
      await this.$axios
        .post("users/block/" + this.user.id)
        .then((res: any) => {
          this.isBlocked = true;
          this.isFriend = false;
        })
        .catch((error: any) => {});
    },
    async unblock() {
      await this.$axios
        .post("users/unblock/" + this.user.id)
        .then((res: any) => {
          this.isBlocked = false;
        })
        .catch((error: any) => {});
    },
    async addFriend() {
      this.$axios
        .post("/friends/add", {
          user_id_to_add: this.user.id,
        })
        .then((res: any) => {
          this.isFriend = true;
        })
        .catch((error: any) => {});
    },
    async removeFriend() {
      await this.$axios
        .post("/friends/remove", {
          user_id_to_remove: this.user.id,
        })
        .then((res: any) => {
          this.isFriend = false;
        })
        .catch((error: any) => {});
    },
  },
});
</script>

<style scoped>
.row-color {
  display: table-row;
}

.row-color:hover {
  background: rgb(94, 53, 177) !important;
}

.v-window {
  background-color: rgb(81, 45, 168) !important;
}
</style>
