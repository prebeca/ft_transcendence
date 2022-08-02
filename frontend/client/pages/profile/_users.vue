<template>
  <div style="height: 100vh; max-height: 100%" class="d-flex justify-center">
    <v-card color="secondary" class="mt-15" width="1000px" height="400px">
      <div class="d-block-flex">
        <div class="d-inline-flex">
          <UserButtonCard :user="user" />
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
        avatar: "",
      },
      user: {
        avatar: "",
        player: {},
        friends: [],
      },
    };
  },
  mounted() {
    this.getUser(this.$route.params.users);
  },
  watch: {
    "$route.params.users"(newUsername: string, oldUsername: string) {
      this.getUser(newUsername);
    },
  },
  methods: {
    getUser(username: string) {
      this.$axios
        .get("/users/" + this.$route.params.users)
        .then((res) => {
          this.user = res.data;
          if (this.user !== null) this.changeAvatar(this.user.avatar);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
  },
});
</script>
