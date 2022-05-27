<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <p>LISTS</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  created: async function () {
    await this.$axios
      .get("/gameroom/list")
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  methods: {
    async join() {
      console.log("does nothing");
    },
  },
});
</script>
