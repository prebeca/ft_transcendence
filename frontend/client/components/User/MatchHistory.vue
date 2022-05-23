<template>
  <v-card
    class="mx-auto"
    color="secondary"
    width="700px"
    height="300px"
    elevation="20"
    outlined
  >
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MatchHistoryCard",
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