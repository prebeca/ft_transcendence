<template>

  <!--
  <v-form ref="form" class="d-flex flex-column" style="row-gap: 40px">
  <v-container fluid>
    <v-row align="center">
      <v-col cols="6">
        <v-subheader>
          Select your difficulty
        </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="difficulty"
          :items="difficulty"
          thumb-label="always"
        ></v-select>
      <template v-slot:thumb-label>
        <span class="font-weight-bold" style="font-size: 15px">
          {{ difficulty }}
        </span>
      </template>
      </v-col>
      <v-col cols="6">
        <v-subheader>
          Select how many point to win
        </v-subheader>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="e2"
          :items="points"
          menu-props="auto"
          hide-details
          label="Select"
          single-line
        ></v-select>
      </v-col>
    </v-row>
  </v-container>

  <v-btn color="accent" @click="validate"> Validate </v-btn>
  </v-form>
  -->

  <v-form ref="form" class="d-flex flex-column" style="row-gap: 40px">

   <!-- <h2>Select your difficulty</h2>
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
    </v-slider>-->

    <h2>Select the difficulty</h2>
    <v-radio-group
      v-model="difficulty"
      row
    >
      <v-radio
        label=Easy
        value="Easy"
      ></v-radio>
      <v-radio
        label=Medium
        value="Medium"
      ></v-radio>
      <v-radio
        label=Hard
        value="Hard"
      ></v-radio>
      </v-radio-group>
      <template v-slot:thumb-label>
        <span class="font-weight-bold" style="font-size: 15px">
          {{ difficulty }}
        </span>
      </template>


    <h2>Select score for win</h2>
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


    <h2>Select map</h2>
    <v-radio-group
      v-model="map"
      row
    >
      <v-radio
        label=Pong
        value="Pong"
      ></v-radio>
      <v-radio
        label=Tennis
        value="Tennis"
      ></v-radio>
      </v-radio-group>
      <template v-slot:thumb-label>
        <span class="font-weight-bold" style="font-size: 15px">
          {{ map }}
        </span>
      </template>
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
        .catch((error) => {
          console.log(error);
        });
    },
  },
});
</script>

