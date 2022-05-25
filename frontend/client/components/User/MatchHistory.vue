<template>
  <v-card
    class="mx-auto"
    color="secondary"
    height="500px"
    outlined
  >

    <v-toolbar
      color="primary"
      height="15px"
      flat
    >
      <template v-slot:extension>
        <v-tabs
          v-model="tabs"
          centered
          color="info"
        >
          <v-tab
            v-for="n in 2"
            :key="n"
          >
            {{ tab[n - 1] }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

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
      tabs: null,
      tab: ['Match History', 'Friends List']
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