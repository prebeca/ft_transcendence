<template>
  <v-card width="500px" height="500px" color="secondary" elevation="20">
    <v-toolbar color="primary" class="d-flex justify-center">
      <v-toolbar-title class="font-weight-black info--text" style="font-size: 25px">
        {{ title }} : {{ username }}
      </v-toolbar-title>
    </v-toolbar>

    <v-row class="pt-10" justify="center" align="center">
      <v-avatar size="200px">
        <img :src="playerAvatar" alt="avatar" />
      </v-avatar>
    </v-row>

    <v-row justify="center" class="pt-5">
      <h3 class="d-inline font-weight-black mr-10">SCORE : {{ score }}</h3>
    </v-row>
    <v-row justify="center" class="pt-5">
      <h3 class="d-inline font-weight-black mr-10">
        NEW XP : {{ player.xp }} / {{ player.level * 200 }}
      </h3>
    </v-row>
    <v-row justify="center" class="pt-5">
      <h3 class="d-inline font-weight-black mr-10">
        NEW LEVEL : {{ player.level }} (+{{ player.level - level }})
      </h3>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "WinnerLooserCard",
  props: {
    player: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    xp: {
      type: Number,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    }
  },

  computed: {
    playerAvatar(): string {
      return `${process.env.API_URL}/users/profile/avatar/${this.player.avatar}`;
    },
  },
});
</script>