<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-card color="secondary" width="500px" height="550px" elevation="20">
      <v-toolbar color="primary" class="d-flex justify-center">
        <v-toolbar-title
          class="font-weight-black info--text"
          style="font-size: 20px"
        >
          SET UP YOUR TWO-FACTOR AUTHENTIFICATION
        </v-toolbar-title>
      </v-toolbar>

      <v-row class="pt-12 pb-2" justify="center" align="center">
        <img style="height: 244px; width: 244px" :src="qr_code" />
      </v-row>

      <v-form ref="form">
        <div class="ma-auto" style="max-width: 400px">
          <v-otp-input
            :length="codeLength"
            v-model="code"
            required
            class="pa-10"
          ></v-otp-input>
        </div>

        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-center align-center">
          <v-btn :disabled="!isActive" color="accent" text @click="validate">
            Validate
          </v-btn>
        </v-card-actions>
      </v-form>

      <v-snackbar
        v-model="snackbar"
        :vertical="vertical"
        color="accent"
        centered
      >
        <span>
          OTP is either expired or not valid. A new QR Code will be generated.
        </span>
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      qr_code: "" as string,
      code: "" as string,
      codeLength: 6 as number,
      snackbar: false as boolean,
      vertical: true as boolean,
    };
  },
  created: async function () {
    this.generateQr();
  },
  computed: {
    isActive: function (): boolean {
      return this.code.length === this.codeLength;
    },
  },
  methods: {
    async generateQr() {
      fetch(`${process.env.API_URL}/2fa/generate-qr`, {
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
                return reader
                  .read()
                  .then(({ done, value }: { done: any; value: any }) => {
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
          this.snackbar = true;
          (this.code = ""), this.generateQr();
        });
    },
  },
});
</script>
