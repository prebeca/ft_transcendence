<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-btn
      rounded
      to="/groom/selection"
      style="width: 220px; height: 80px"
      color="accent"
      elevation="20"
    >
      <span class="font-weight-black" style="font-size: 30px">Play Now</span>
    </v-btn>
    <v-btn color="accent" class="mr-5" @click="matchmaking">
      Matchmaking
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  methods: {
    async matchmaking() {},
  },
});
</script>

<style scoped lang="scss">
</style>