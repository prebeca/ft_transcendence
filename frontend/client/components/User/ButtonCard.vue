<template>
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

    <v-card-actions v-if="isUser === false">
      <div class="pt-2">
        <div>
          <v-btn
            color="success"
            width="200px"
            v-if="isFriend === false"
            @click="addFriend"
          >
            Add Friend
          </v-btn>
          <v-btn color="primary" width="200px" v-else @click="removeFriend">
            Remove Friend
          </v-btn>
        </div>

        <div class="pt-2">
          <v-btn color="accent" width="200px" v-if="!isBlocked" @click="block">
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
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ButtonCard",
  data() {
    return {
      isUser: false,
      isFriend: false,
      isBlocked: false,
      currentUser: {
        id: "",
        blocked: [] as any,
        friends: [
          {
            id: "",
          },
        ],
      },
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  created: async function () {
    await this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.currentUser = res.data;
        if (this.currentUser.id === this.user.id) {
          this.isUser = true;
        }
        if (
          this.currentUser.friends.find((e) => {
            return e.id == this.user.id;
          })
        )
          this.isFriend = true;
      })
      .catch((error) => {
        console.error(error);
      });

    console.log(this.currentUser.blocked);
    if (this.currentUser.blocked !== undefined) {
      if (
        this.currentUser.blocked.find((e: any) => {
          return e.id == this.user.id;
        }) != undefined
      )
        this.isBlocked = true;
    }
  },
  methods: {
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
