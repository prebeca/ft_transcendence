<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column align-center justify-center"
  >
    <v-card color="secondary" width="400px" height="300px" elevation="20">
      <v-toolbar color="primary" class="d-flex justify-center">
        <v-toolbar-title
          class="font-weight-black info--text"
          style="font-size: 20px"
        >
          TWO-FACTOR AUTHENTIFICATION
        </v-toolbar-title>
      </v-toolbar>

      <v-form ref="form" v-model="valid" lazy-validation>
        <v-otp-input
          :length="length"
          v-model="code"
          required
          class="pa-14"
        ></v-otp-input>

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
        OTP is either expired or not valid. Try again.
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default {
  name: "2fa",
  layout: "empty",
  data() {
    return {
      code: "",
      length: 6,
      snackbar: false,
      vertical: true,
      user: {},
    };
  },
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.user = res.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
  computed: {
    isActive() {
      return this.code.length === this.length;
    },
  },
  methods: {
    async validate() {
      const { code } = this;
      console.log(this.code);
      this.$axios
        .post("/2fa/authenticate", {
          code: this.code,
        })
        .then((res) => {
          if (res.data === true) {
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          this.snackbar = true;
          (this.code = ""), console.error("error: " + error);
        });
    },
  },
};
</script>
