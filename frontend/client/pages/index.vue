<template>
  <div style="height: 100vh; max-height: 100%; row-gap: 80px" 
   class="d-flex flex-column justify-center align-center">
    <h1 style="font-size: 60px;"
     class="text-center info--text">PONG GAME</h1>
    <v-btn rounded to="/login" 
     style="width: 220px; height: 80px;" 
     color="secondary"
     elevation="20">
      <span class="font-weight-black d-inline pa-1" 
       style="font-size: 20px">LOGIN WITH</span>
      <v-img src="/42white.png" 
       style="height: 130px; width: 70px" ></v-img>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
}
</script>

<style scoped>
</style>