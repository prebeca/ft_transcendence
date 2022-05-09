<template>
    
    <v-navigation-drawer absolute permanent expand-on-hover color="secondary">

        <v-list nav dense class="pt-16">
          <v-list-item to="/home">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item to="/game">
            <v-list-item-icon>
              <v-icon>mdi-gamepad-variant</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Game</v-list-item-title>
          </v-list-item>
          <v-list-item to="/chat">
            <v-list-item-icon>
              <v-icon>mdi-wechat</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Community</v-list-item-title>
          </v-list-item>
          <v-list-item to="/leaderboard">
            <v-list-item-icon>
              <v-icon>mdi-trophy</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Leaderboard</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

</template>

<style scoped>

</style>