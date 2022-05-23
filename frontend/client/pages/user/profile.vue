<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-row>
      <v-col>
        <div>
          <UserProfileCard />
        </div>

        <div class="mt-2">
          <UserMatchHistory />
        </div>
      </v-col>

      <v-col class="ml-2">
        <UserFriendsCard />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>
