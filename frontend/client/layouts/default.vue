<template>
  <v-app dark>
    <v-app-bar app color="primary" clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-text="title" class="info--text" />

      <v-spacer></v-spacer>

      <v-menu bottom min-width="200px" rounded offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <!-- <v-avatar>
              <v-img :src="avatar"></v-img>
            </v-avatar> -->
            <UserAvatarStatus
              v-if="user.id !== 0"
              :size="sizeOfAvatar"
              :user="user"
              :offset="20"
            />
          </v-btn>
        </template>
        <LayoutUserCard />
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer app v-model="drawer" clipped color="secondary">
      <v-list nav v-for="item in items" :key="item.title">
        <v-list-item :to="item.url">
          <v-list-item-icon>
            <v-icon>{{ `mdi-${item.icon}` }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <LayoutFooter />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "DefaultLayout",
  data() {
    return {
      title: "PONG GAME",
      sizeOfAvatar: "50px",
      user: {
        id: 0,
        avatar: "",
      },
      drawer: false,
      avatar: "",
      cacheKey: +new Date(),
      items: [
        {
          title: "Home",
          icon: "home",
          url: "/home",
        },
        {
          title: "Game",
          icon: "gamepad-variant",
          url: "/groom/selection",
        },
        {
          title: "Community",
          icon: "wechat",
          url: "/chat",
        },
        {
          title: "Leaderboard",
          icon: "trophy",
          url: "/leaderboard",
        },
      ],
    };
  },
  created: async function () {
    await this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.user.id = res.data.id;
        console.log(this.user.id);
        this.changeAvatar(res.data.avatar);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
  },
});
</script>

<style scoped>
.v-application {
  background-color: rgb(77, 77, 77);
}
</style>
