<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-form ref="form">
      <v-btn color="success" class="mr-4" @click="validate"> Validate </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  methods: {
    async validate() {
      await this.$axios
        .get("/gameroom/create")
        .then((res) => {
          this.$router.push({ path: "/groom/room", query: { name: res.data } });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});
</script>
