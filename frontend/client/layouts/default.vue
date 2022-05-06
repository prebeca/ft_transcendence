<template>
  <v-app dark>

    <NavDrawer />
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
      v-if="user.login"
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <Footer />

  </v-app>
</template>

<script lang="ts">

export default {
  name: 'DefaultLayout',
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        },
         {
          icon: 'mdi-apps',
          title: 'UserPage',
          to: '/userpage'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'The Pong Game',
      user : {
        login : true,
      }
    }
  }
}
</script>

<style scoped>
.v-application {
  background-color: rgb(77, 77, 77);
}
</style>
