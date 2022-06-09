<template>
  <router-link :to="userProfile" class="text-decoration-none">
    <div class="d-flex flex-column align-center">
      <v-avatar size="80">
        <img alt="friend-avatar" :src="friend.avatar" />
      </v-avatar>
      <h3 class="mt-2 info--text">
        {{ friend.username }}
      </h3>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    friend: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userProfile(): string {
      return `/profile/${this.friend.username}`;
    },
  },
});
</script>