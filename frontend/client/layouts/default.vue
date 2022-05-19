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
import Vue from 'vue';

export default Vue.extend ({
  name: 'DefaultLayout',
  data () {
    return {
    }
  }
})

</script>

<style scoped>
.v-application {
  background-color: rgb(77, 77, 77);
}
</style>
