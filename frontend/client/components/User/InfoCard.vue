<template>
    <v-card
        class="mx-auto"
        color="secondary"
        height="320px"
        width="600px"
        outlined
    >
        <v-card-title
          class="font-weight-bold text-uppercase info--text font-size"
        >
            {{ user.username }}
        </v-card-title>

        <v-badge
          class="ml-3"
          v-if="isConnected"
          inline
          left
          color="success"
          dot
        >on line
        </v-badge>

        <v-badge
          class="ml-3"
          v-if="!isConnected"
          inline
          left
          color="grey"
          dot
        >off line
        </v-badge>

    </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "InfoCard",
  data() {
    return {
      isUser: false,
      isConnected: false,
      user: {
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
      })
      .catch((error) => {
        console.error(error);
      });
  },
});
</script>