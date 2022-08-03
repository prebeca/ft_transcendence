<template>
  <div>
    <v-badge :color="status_color" bottom :offset-x="offset" :offset-y="offset">
      <v-avatar :size="size">
        <img :src="user.avatar" alt="avatar" />
      </v-avatar>
    </v-badge>
  </div>
</template>

<script lang="ts">
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
      status_color: "gray",
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
    this.user.avatar =
      `${process.env.API_URL}/users/profile/avatar/` + this.user.avatar;
    this.statusSocket.on("changeAvatar" + this.user.id, (data) => {
      this.user.avatar = `${process.env.API_URL}/users/profile/avatar/` + data;
    });
    this.statusSocket.on("changeStatus" + this.user.id, (data) => {
      this.status = data;
      if (this.status === "connected") this.status_color = "green";
      else if (this.status === "disconnected") this.status_color = "grey";
      else if (this.status === "inGame") this.status_color = "yellow";
      else this.status_color = "blue";
    });
    this.statusSocket.on("handshake", (data) => {});
  },
  mounted() {
    this.statusSocket.emit("information", this.user.id);
  },
  beforeDestroy() {},
});
</script>