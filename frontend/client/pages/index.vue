<template>
  <div class="main d-flex flex-column justify-center align-center">
    <h1 class="text-center info--text">PONG GAME</h1>
    <v-btn 
     style="width: 220px; height: 80px;" 
     color="secondary"
     elevation="20"
     @click="login"
     >
      <span class="font-weight-black d-inline pa-1">LOGIN WITH</span>
      <v-img src="/42white.png" 
       style="height: 130px; width: 70px" ></v-img>
    </v-btn>
  </div>
</template>

<script lang="ts">
export default {
  name: 'IndexPage',
  layout: 'empty',
	methods: {
		async login() {
       await fetch("http://localhost:3000/auth/login");
		},
	},
};
</script>
