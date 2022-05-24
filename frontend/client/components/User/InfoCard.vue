<template>
    <v-card
        class="mx-auto"
        color="secondary"
        width="770px"
        height="320px"
        outlined
    >
        <v-card-title
            class="pa-5"
        >
            {{ user.username }}
        </v-card-title>

    </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "InfoCard",
  data() {
    return {
      isUser: false,
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