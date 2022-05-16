<template>
  <div class="main d-flex flex-column justify-center align-center">
    <h1 class="text-center info--text">PONG GAME</h1>
    <v-btn rounded
     style="width: 220px; height: 80px;"
     color="secondary"
     elevation="20"
     :href="url">
      <span class="font-weight-black d-inline pa-1">LOGIN WITH</span>
      <v-img src="/42white.png"
       style="height: 130px; width: 70px" ></v-img>
    </v-btn>
    <button v-on:click="log">Greet</button>
    <button v-on:click="game">Game</button>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';

export default ({
  layout: 'empty',
  name: 'IndexPage',
  data: () => ({
    url: `${process.env.API_URL}/auth/a`,
    token: '',
    res0: '',
  }),
  methods: {
		async log() {
			this.res0 = await fetch(`${process.env.API_URL}/auth/a`).then((res) => res.json());
      console.log(this.res0);
		},
    game() {
      this.$router.push("/game");
    }
  },
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
