<template>
  <v-app dark>

    <LayoutNavBar />

    <LayoutNavDrawer />

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <LayoutFooter />

  </v-app>
</template>

<script lang="ts">

export default {
  name: 'DefaultLayout',
  data () {
    return {
      
    }
  }
}
</script>

<style scoped>
.v-application {
  background-color: rgb(77, 77, 77);
}
</style>
