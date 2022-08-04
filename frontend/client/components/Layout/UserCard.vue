<template>
  <v-card color="secondary">
    <v-list-item-content class="justify-center">
      <div class="mx-auto text-center">
        <UserAvatarStatus :size="sizeOfAvatar" :user="user" :offset="25" />
        <v-divider class="my-3"></v-divider>
        <v-btn :to="userProfile" depressed rounded text color="info">
          Your Profile
        </v-btn>
        <v-divider class="my-3"></v-divider>
        <v-btn to="/user/edit" depressed rounded text color="info">
          Edit Your Profile
        </v-btn>
        <v-divider class="my-3"></v-divider>
        <v-btn @click="logout" depressed rounded text color="accent">
          Log out
        </v-btn>
      </div>
    </v-list-item-content>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "UserCard",
  data() {
    return {
      sizeOfAvatar: "120px",
      user: {
        id: 0 as number,
        username: "" as string,
        avatar: "" as string,
      },
    };
  },
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
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
    logout() {
      this.$axios
        .get("/auth/logout")
        .then((res) => {
          this.$router.push("/");
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
  computed: {
    userProfile(): string {
      return `/profile/${this.user.id}`;
    },
  },
});
</script>