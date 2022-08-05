<template>
  <v-form
    ref="form"
    class="d-flex flex-column align-center"
    style="row-gap: 30px"
  >
    <h2 class="pb-5">Select the difficulty</h2>
    <v-radio-group v-model="difficulty" row>
      <v-radio label="Easy" value="Easy"></v-radio>
      <v-radio label="Medium" value="Medium"></v-radio>
      <v-radio label="Hard" value="Hard"></v-radio>
    </v-radio-group>
    <!-- <template v-slot:thumb-label>
      <span class="font-weight-bold" style="font-size: 15px">
        {{ difficulty }}
      </span>
    </template> -->

    <div>
      <h2 class="pb-5">Select score for win</h2>
      <v-slider
        v-model="points"
        thumb-label="always"
        thumb-size="40"
        max="20"
        min="1"
        class="mt-10"
      >
        <template v-slot:thumb-label>
          <span class="font-weight-bold" style="font-size: 15px">
            {{ points }}
          </span>
        </template>
      </v-slider>
    </div>

    <h2>Select map</h2>
    <v-radio-group v-model="map" row>
      <v-radio label="Pong" value="Pong"></v-radio>
      <v-radio label="Tennis" value="Tennis"></v-radio>
      <v-radio label="Golf" value="Golf"></v-radio>
    </v-radio-group>
    <!-- <template v-slot:thumb-label>
      <span class="font-weight-bold" style="font-size: 15px">
        {{ map }}
      </span>
    </template> -->
    <v-btn color="accent" @click="validate"> Validate </v-btn>
  </v-form>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      difficulty: "Medium",
      points: 5,
      map: "Pong",
    };
  },
  methods: {
    async validate() {
      await this.$axios //-> POST CREATION WITH OPTION will generate new name and with the return the game Room will be instanciated
        .post("/gameroom/create", {
          difficulty: this.difficulty,
          points: this.points,
          map: this.map,
        })
        .then((res) => {
          this.$router.push({ path: "/groom/room", query: { name: res.data } });
        })
        .catch((error) => {});
    },
  },
});
</script>

