<template>
  <v-card
    class="mx-auto"
    color="secondary"
    max-width="1400px"
    max-height="350px"
    elevation="20"
    outlined
  >
    <v-list-item>

      <v-avatar size="200px" tile class="mt-4">
        <img :src="user.avatar" alt="avatar" />
      </v-avatar>
      <v-list-item-content style="justify-items: start">
        <v-list-item-title class="text-h4 ml-4">
          {{ user.username }}
        </v-list-item-title>
        <div class="text-overline ml-4">
          <v-badge
            inline
            left
            color="success"
          >online</v-badge>
        </div>

        <v-list-item-subtitle></v-list-item-subtitle>
      </v-list-item-content>
      
    </v-list-item>

    <v-card-actions v-if="isUser === false" class="d-flex flex-column align-start ml-2" >       

        <div class="my-2">
          <div>
            <v-btn color="success" width="200px" v-if="!isFriend && !requestSent && !requestReceived" @click="sendRequest" :loading="loading1">
              Send Friend Request
            </v-btn>
            <v-btn color="success" width="200px" v-else-if="!isFriend && requestReceived" @click="acceptRequest" :loading="loading1">
              Accept Friend Request
            </v-btn>
            <v-btn color="primary" width="200px" v-else-if="!isFriend && requestSent" style="pointer-events:none">
              Friend Request Sent
            </v-btn>
            <v-btn color="primary" width="200px" v-else @click="removeFriend" :loading="loading1">
              Remove Friend
            </v-btn>
          </div>

          <div class="mt-3">
            <v-btn color="accent" width="200px" v-if="!isBlocked" @click="blockUser" :loading="loading2">
              Block User
            </v-btn>
            <v-btn color="primary" width="200px" v-else @click="unblockUser" :loading="loading2">
              Unblock User
            </v-btn>
          </div>
        </div>
          
    </v-card-actions>

    <v-card-actions v-else class="ml-2 my-1">
      <v-btn color="primary" width="200px">
        EDIT YOUR PROFILE
      </v-btn>
    </v-card-actions>


  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "UserCard",
  data() {
    return {
      isUser: false,
      isFriend: false,
      isBlocked: false,
      requestSent: false,
      requestReceived: false,
      loading1: false,
      loading2: false,
      user: {
        avatar: "",
        username: "",
      },
    };
  },
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.user = res.data;
        this.changeAvatar(res.data.avatar);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
    async sendRequest() {
      this.loading1 = true;
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.loading1 = false;
      this.requestSent = true;
    },
    async acceptRequest() {
      this.loading1 = true;
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.loading1 = false;
      this.requestSent = false,
      this.requestReceived = false,
      this.isFriend = true;
    },
    async removeFriend() {
      this.loading1 = true;
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.loading1 = false;
      this.isFriend = false;
    },
    async blockUser() {
      this.loading2 = true;
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.loading2 = false;
      this.isBlocked = true;
    },
    async unblockUser() {
      this.loading2 = true;
      await new Promise(resolve => setTimeout(resolve, 3000))
      this.loading2 = false;
      this.isBlocked = false;
    },
  },
});
</script>
