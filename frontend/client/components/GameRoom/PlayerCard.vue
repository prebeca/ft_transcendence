<template>
  <v-card width="400px" height="400px" color="secondary" elevation="20">
    <v-toolbar color="primary" class="d-flex justify-center">
      <v-toolbar-title
        class="font-weight-black info--text"
        style="font-size: 25px"
      >
        {{ player.username }}
      </v-toolbar-title>
    </v-toolbar>

    <v-row class="pt-10" justify="center" align="center">
      <v-avatar size="200px">
        <img :src="player.avatar" alt="avatar" />
      </v-avatar>
    </v-row>

    <v-row justify="center" class="pt-5">
      <h3 class="d-inline font-weight-black mr-10">LEVEL {{ player.level }}</h3>
      <h3 class="d-inline font-weight-black ml-10">{{ player.mmr }} MMR</h3>
    </v-row>
    <v-row class="mt-5 pb-10" justify="center">
      <h3 class="d-inline font-weight-black success--text">
        WINS : {{ player.wins }}
      </h3>
      <h3 class="d-inline font-weight-black px-5">/</h3>
      <h3 class="d-inline font-weight-black accent--text">
        LOSSES : {{ player.losses }}
      </h3>
    </v-row>
  </v-card>
</template>

<script>
import GameRoomVue from "../../pages/groom/room.vue";

export default {
  name: "GameRoomPlayerCard",
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
};
</script>