<template>
  <NuxtLink
    :to="{ path: userProfile, params: { key: 1 } }"
    class="text-decoration-none"
  >
    <div class="d-flex flex-column align-center">
      <v-avatar size="80">
        <img alt="friend-avatar" :src="friendAvatar" />
      </v-avatar>
      <h3 class="mt-2 info--text">
        {{ friend.username }}
      </h3>
    </div>
  </NuxtLink>
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
    friendAvatar(): string {
      return `${process.env.API_URL}/users/profile/avatar/${this.friend.avatar}`;
    },
  },
});
</script>