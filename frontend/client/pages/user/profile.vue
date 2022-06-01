<template>
  <div style="height: 100vh; max-height: 100%" class="d-flex justify-center">
    <v-card color="secondary" class="mt-15" width="1000px" height="400px">
      <div class="d-block-flex">
        <div class="d-inline-flex">
          <UserButtonCard />
          <UserInfoCard />
        </div>

        <UserMatchHistory />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>
