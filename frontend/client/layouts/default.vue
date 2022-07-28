<template>
  <v-app dark>
    <v-app-bar app color="primary" clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-text="title" class="info--text" />

      <v-spacer></v-spacer>

      <v-menu bottom min-width="200px" rounded offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <UserAvatarStatus
              v-if="user.id !== undefined"
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
        <NuxtChild :user="user" :socket="socket" />
      </v-container>
    </v-main>
    <v-snackbar :color="snackcolor" right v-model="snackbar" :timeout="timeout">
      {{ notif_text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <LayoutFooter />
  </v-app>
</template>

<script lang="ts">
import { NuxtSocket } from "nuxt-socket-io";
import Vue from "vue";

interface Message {
  id: number;
  target_id: number;
  user_id: number;
  user_name: string;
  content: string;
}

interface Channel {
  id: number;
  name: string; // for classic channels
  username: string; // for DM channel
  users: User[];
  messages: Message[];
}

interface User {
  id: number;
  username: string;
  friends: Channel[];
  avatar: string;
}

interface Alert {
  type: string;
  content: string;
  color: string;
}

export default Vue.extend({
  name: "DefaultLayout",

  data() {
    return {
      snackbar: false,
      snackcolor: "white",
      timeout: 5000,
      notif_text: "",
      user: {} as User,
      socket: {} as NuxtSocket,
      title: "PONG GAME",
      sizeOfAvatar: "50px",
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
        this.user = res.data;
        this.changeAvatar(res.data.avatar);
        this.user.friends.forEach((e) => {
          e.messages = [];
        });
      })
      .catch((error) => {
        console.error(error);
      });

    this.socket = this.$nuxtSocket({ name: "chat", withCredentials: true });

    this.socket.emit("SetSocket");

    this.socket.on("PrivateMessage", async (msg, cb) => {
      console.log(msg.user_name + ": " + msg.content);
      let id = this.user.id == msg.target_id ? msg.user_id : msg.target_id;
      if (msg != null) {
        this.user.friends
          .find((e) => {
            return e.id == id;
          })
          ?.messages.push(msg);
      }
    });
    this.socket.on("Alert", async (alert: Alert, cb) => {
      console.log("new Alert");
      this.notif_text = alert.content;
      this.snackcolor = alert.color;
      this.snackbar = true;
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
