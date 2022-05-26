<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="code"
        :rules="rules.required"
        label="Code"
        required
      ></v-text-field>

      <v-btn :disabled="!valid" color="success" class="mr-4" @click="validate">
        Validate
      </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "2fa",
  data() {
    return {
      code: "",
      rules: {
        required: (value) => !!value || "Required",
      },
    };
  },
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.user = res.data;
        this.changeAvatar(res.data.avatar);
      })
      .catch((error) => {
        console.error(error);
      });
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
          console.log("code validated: " + res);
        })
        .catch((error) => {
          console.error("error: " + error);
        });
    },
  },
});
</script>
