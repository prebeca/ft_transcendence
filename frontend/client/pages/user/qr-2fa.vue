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
    this.generateQr();
  },
  methods: {
    async generateQr() {
      fetch("http://localhost:3000/2fa/generate-qr", {
        method: "POST",
        credentials: "include",
      })
        .then((response: Response) => response.body)
        .then((body: any) => {
          const reader = body.getReader();
          return new ReadableStream({
            start(controller) {
              return pump();
              function pump() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  return pump();
                });
              }
            },
          });
        })
        .then((stream) => new Response(stream))
        .then((response) => response.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => console.log((this.qr_code = url)))
        .catch((err) => console.error(err));
    },
    async validate() {
      const { code } = this;
      console.log(this.code);
      this.$axios
        .post("/2fa/turn-on-qr", {
          code: this.code,
        })
        .then((res) => {
          if (res.data === true) {
            this.$router.push("/");
          }
        })
        .catch((error) => {
          this.generateQr();
        });
    },
  },
});
</script>
