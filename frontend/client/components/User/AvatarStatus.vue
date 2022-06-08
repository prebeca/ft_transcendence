<template>
  <div>
    <v-avatar :size="size">
      <img :src="user.avatar" alt="avatar" />
    </v-avatar>
    <p>{{ this.user.id }}-{{ this.status }}</p>
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
      statusSocket: this.$nuxtSocket({
        name: "socketstatus",
        withCredentials: true,
        persist: "myAvatarStatusSocket",
      }),
      status: "",
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
  },
  created() {
    console.log(this.user.id);
    this.statusSocket.on("changeStatus" + this.user.id, (data) => {
      console.log(
        "change in status (or avatar) for user " + this.user.id,
        "data = " + data
      );
      this.status = data;
    });
    this.statusSocket.on("handshake", (data) => {
      console.log(data);
    });
  },
  mounted() {
    this.statusSocket.emit("information", this.user.id);
    console.log("ask for info");
  },
  beforeDestroy() {
    console.log("BeforeDestruction: leaving avatar Status component");
  },
});
</script>