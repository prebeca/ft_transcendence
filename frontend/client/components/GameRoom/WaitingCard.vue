<template>
  <v-card
    width="400px"
    height="400px"
    color="secondary"
    elevation="20"
    class="d-flex flex-column justify-center align-center"
  >
    <v-progress-circular
      :size="100"
      :width="7"
      color="purple"
      indeterminate
    ></v-progress-circular>
    <h3 class="mt-5">Waiting for a player</h3>
  </v-card>
</template>

<script>
export default {};
</script>

