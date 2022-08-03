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
        <UserMatchHistory :user="user" :friends="user.friends" />
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
      },
      isUser: false,
      isFriend: false,
      isBlocked: false,
    };
  },
  mounted() {
    this.getUser(this.$route.params.users);
    this.getCurrentUser();
  },
  watch: {
    "$route.params.users"(newUsername: string, oldUsername: string) {
      this.getUser(newUsername);
      this.getCurrentUser();
    },
  },
  methods: {
    getCurrentUser() {
      this.$axios
        .get("/users/profile")
        .then((res) => {
          console.log(res.data);
          this.currentUser = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getUser(username: string) {
      this.$axios
        .get("/users/" + this.$route.params.users)
        .then((res) => {
          this.user = res.data;
          if (this.user !== null) {
            this.changeAvatar(this.user.avatar);
            this.changeButtonData(this.user.id);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
    changeButtonData(user_id: string) {
      if (this.currentUser.id === user_id) {
        this.isUser = true;
        this.isFriend = false;
        this.isBlocked = false;
      } else {
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
      }
    },
    async block() {
      console.log("block user");
      await this.$axios
        .post("users/block/" + this.user.id)
        .then((res) => {
          this.isBlocked = true;
          this.isFriend = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async unblock() {
      console.log("unblock user");
      await this.$axios
        .post("users/unblock/" + this.user.id)
        .then((res) => {
          this.isBlocked = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async addFriend() {
      this.$axios
        .post("/friends/add", {
          user_id_to_add: this.user.id,
        })
        .then((res) => {
          console.log(res);
          this.isFriend = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async removeFriend() {
      await this.$axios
        .post("/friends/remove", {
          user_id_to_remove: this.user.id,
        })
        .then((res) => {
          console.log(res);
          this.isFriend = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});
</script>
