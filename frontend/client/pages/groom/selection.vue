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
            <h1>What do you want to do ?</h1>
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
            <GameRoomDifficulty v-if="e1 === 2" />
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
            <GameRoomList v-if="e1 === 3" />
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
    };
  },
});
</script>


