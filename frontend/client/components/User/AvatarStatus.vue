<template>
  <div>
    <v-badge color="green" bottom :offset-x="offset" :offset-y="offset">
      <v-avatar :size="size">
        <img :src="user.avatar" alt="avatar" />
      </v-avatar>
      <!-- <p>{{ this.status }}</p> -->
    </v-badge>
  </div>
</template>

<script lang="ts">
import type { NuxtSocket } from "nuxt-socket-io";
import Vue from "vue";
/*
 ** The idea is to use this component everywhere we see the avatars
 ** It will display the status using circle of colors (gray, red and green)
 ** It will use one socket (a persistant one, we want to use the same socket for a same client)
 ** It will only listen to user+id passed in props?
 ** So that each component only listen to its specific user
 ** I don't know if it is possible but should be amazing
 **
 */
export default Vue.extend({
  data() {
    return {
      socket: {} as NuxtSocket,
      status: "connected",
    };
  },
  props: {
    size: {
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    offset: {
      required: true,
    },
  },
  created() {
    console.log("created avatar Status component");
    this.socket = this.$nuxtSocket({
      name: "avatarstatus",
      withCredentials: true,
      persist: "myAvatarStatusSocket",
    });
  },
  beforeMount() {
    console.log("beforeMount");
    this.socket.on("handshake", (data) => {
      console.log(data);
    });
  },
  mounted() {
    console.log("mouted avatar Status component");
    console.log(this.user);
  },
  beforeDestroy() {
    console.log("BeforeDestruction: leaving avatar Status component");
    // this.socket.emit("leaveRoom", this.roomid);
  },
});
</script>