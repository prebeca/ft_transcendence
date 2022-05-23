<template>
  <v-card
    class="mx-auto"
    color="secondary"
    width="700px"
    height="300px"
    elevation="20"
    outlined
  >
    <v-list-item three-line class="mt-5">
      <v-avatar size="180px">
        <img :src="user.avatar" alt="avatar" />
      </v-avatar>
      <v-list-item-content class="ml-5">
        <v-list-item-title class="text-h4">
          {{ user.username }}
        </v-list-item-title>
        <div class="text-overline mb-4"></div>

        <v-list-item-subtitle></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions class="mt-2" width="180px">
      <v-btn color="success" fab large class="mx-4">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
      <v-btn color="accent" fab large class="mx-4">
        <v-icon>mdi-account-circle</v-icon>
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
  },
});
</script>
