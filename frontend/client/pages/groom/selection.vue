<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-stepper v-model="e1" width="800px" height="715px">
      <v-stepper-header>
        <v-stepper-step :complete="e1 > 1" step="1" class="pl-16">
          Step 1
        </v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2" class="pr-16">
          Step 2
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-card
            class="d-flex flex-column align-center justify-center"
            color="secondary"
            height="600px"
            width="800px"
            style="row-gap: 50px"
          >
            <h1>What do you to do ?</h1>
            <div>
              <v-btn color="accent" class="mr-5" @click="e1 = 2">
                Create a new game
              </v-btn>
              <span class="font-weight-bold">or</span>
              <v-btn color="accent" class="ml-5" @click="e1 = 3">
                Join an existing game</v-btn
              >
            </div>
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-card
            class="d-flex align-center justify-center"
            color="secondary"
            height="600px"
            width="800px"
          >
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
          </v-card>
        </v-stepper-content>

        <v-stepper-content step="3">
          <v-card
            class="d-flex flex-column align-center justify-center"
            color="secondary"
            height="600px"
            width="800px"
            style="row-gap: 50px"
          >
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      e1: 1,
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


