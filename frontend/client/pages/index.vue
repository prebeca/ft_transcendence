<template>
  <div class="main d-flex flex-column justify-center align-center">
    <h1 class="text-center info--text">PONG GAME</h1>
    <v-btn
    :href="url"
     style="width: 220px; height: 80px;" 
     color="secondary"
     elevation="20"
     >
      <span class="font-weight-black d-inline pa-1">LOGIN WITH</span>
      <v-img src="/42white.png" 
       style="height: 130px; width: 70px" ></v-img>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'IndexPage',
  layout: 'empty',
  data: () => ({
    url: `http://localhost:3000/auth/a`,
    window: {
      width: 0,
      height: 0,
    },
  }),
});
</script>

<style scoped lang="scss">

.main {
    height: 100vh;
    row-gap: 80px;
}

h1 {
    font-size: 60px;
}

span {
    font-size: 20px;
}
</style>
