<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-form ref="form">
      <h2>Difficulty</h2>
      <p>1 ------ 2 ------ 3</p>
      <v-slider
        v-model="difficulty"
        hint="Im a hint"
        max="3"
        min="1"
      ></v-slider>
      <v-btn color="success" class="mr-4" @click="validate"> Validate </v-btn>
    </v-form>
  </div>
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
