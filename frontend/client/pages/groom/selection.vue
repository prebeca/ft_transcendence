<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-btn color="success" class="mr-4" @click="create"> Create </v-btn>
    <v-btn color="success" class="mr-4" @click="join"> Join </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  methods: {
    async create() {
      this.$router.push("/groom/creation");
    },
    async join() {
      this.$router.push("/groom/list");
    },
  },
});
</script>
