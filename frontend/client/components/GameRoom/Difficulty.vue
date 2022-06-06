<template>
  <v-form ref="form" class="d-flex flex-column" style="row-gap: 40px">
    <h1>Select your difficulty</h1>
    <v-slider
      v-model="difficulty"
      thumb-label="always"
      thumb-size="40"
      max="3"
      min="1"
      class="mt-10"
    >
      <template v-slot:thumb-label>
        <span class="font-weight-bold" style="font-size: 15px">
          {{ difficulty }}
        </span>
      </template>
    </v-slider>
    <v-btn color="accent" @click="validate"> Validate </v-btn>
  </v-form>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      difficulty: 1,
    };
  },
  methods: {
    async validate() {
      await this.$axios //-> POST CREATION WITH OPTION will generate new name and with the return the game Room will be instanciated
        .post("/gameroom/create", {
          difficulty: this.difficulty,
        })
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