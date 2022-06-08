<template>
  <v-card
    class="mx-auto pt-5 pl-5"
    color="secondary"
    height="320px"
    elevation="0"
  >
    <v-card-title class="font-weight-bold text-uppercase info--text font-size">
      {{ user.username }}
    </v-card-title>

    <!-- <v-badge
      class="ml-3"
      v-if="isConnected && !inGame"
      inline
      left
      color="success"
      dot
      >on line
    </v-badge>

    <v-badge class="ml-3" v-else-if="inGame" inline left color="accent" dot
      >in game
    </v-badge>

    <v-badge class="ml-3" v-else inline left color="grey" dot
      >off line
    </v-badge> -->

    <v-card-text class="pt-16">
      <h3 class="font-weight-black pt-5">LEVEL : {{ player.level }}</h3>

      <h3 class="font-weight-black pt-5">MMR : {{ player.mmr }}</h3>

      <div class="pt-5">
        <h3 class="d-inline font-weight-black success--text">
          WINS : {{ player.winnings }}
        </h3>
        <h3 class="d-inline font-weight-black px-2">/</h3>
        <h3 class="d-inline font-weight-black pt-5 accent--text">
          LOSSES : {{ player.losses }}
        </h3>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "InfoCard",
  data() {
    return {
      isConnected: true,
      inGame: true,
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    player: {
      type: Object,
      required: true,
    },
  },
});
</script>