<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <img style="height: 244px; width: 244px" :src="qr_code" />
    <v-form ref="form">
      <v-text-field v-model="code" label="Code" required></v-text-field>

      <v-btn color="success" class="mr-4" @click="validate"> Validate </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      qr_code: "",
      code: "",
    };
  },
  created: async function () {
    let qr_img = "data:image/png;base64,";
    await this.$axios
      .post("/2fa/generate-qr")
      .then((res: any) => {
        qr_img += res.data;
      })
      .catch((error) => {
        console.error(error);
      });
    this.qr_code = qr_img;
  },
  methods: {
    async validate() {
      const { code } = this;
      console.log(this.code);
      this.$axios
        .post("/2fa/turn-on-qr", {
          code: this.code,
        })
        .then((res) => {
          console.log("code validated: " + res);
        })
        .catch((error) => {
          console.error("error: " + error);
        });
    },
  },
});
</script>
