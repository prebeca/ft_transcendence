<template>
  <v-avatar size="200px">
    <img :src="player.avatar" alt="avatar" />
  </v-avatar>
</template>

<script>
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
    return {};
  },
});
</script>