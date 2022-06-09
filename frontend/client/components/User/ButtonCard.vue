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
          <v-btn
            color="accent"
            width="200px"
            v-if="!isBlocked"
            @click="isBlocked = true"
          >
            Block User
          </v-btn>
          <v-btn
            color="primary"
            width="200px"
            v-else
            @click="isBlocked = false"
          >
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
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.currentUser = res.data;
        if (res.data.id === this.user.id) {
          this.isUser = true;
        }
        for (let i = 0; i < this.currentUser.friends.length; i++) {
          if (this.currentUser.friends[i].id === this.user.id)
            this.isFriend = true;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
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
