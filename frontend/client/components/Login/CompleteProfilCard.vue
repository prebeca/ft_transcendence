<template>
  <v-card color="secondary" width="800px" max-height="700px" elevation="20">
    <v-toolbar color="primary" class="d-flex justify-center">
      <v-toolbar-title
        class="font-weight-black info--text"
        style="font-size: 25px"
      >
        COMPLETE YOUR PROFILE
      </v-toolbar-title>
    </v-toolbar>

    <v-row class="pt-12 pb-2" justify="center" align="center">
      <v-avatar size="180px" class="mb-3">
        <img :src="avatar" alt="avatar" />
      </v-avatar>
    </v-row>

    <v-row justify="center">
      <input
        ref="image"
        type="file"
        accept="image/*"
        @change="imageSelected"
        style="display: none"
      />
      <template>
        <v-btn color="info" @click="selectImage" text> SELECT AN IMAGE </v-btn>
        <v-dialog v-model="sizeDialog" persistent max-width="290">
          <v-card color="secondary">
            <v-card-text class="text-h6 pt-5"
              >Avatar size should be less than 2 MB!</v-card-text
            >
            <v-card-text class="text-h6">Select an other avatar.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="sizeDialog = false"> OK </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </v-row>

    <v-row justify="center" class="pt-5">
      <v-slide-x-transition>
        <div v-if="avatar && saving == true">
          <v-btn
            class="upload-button info--text"
            color="primary"
            @click="saveAvatar"
          >
            UPLOAD
          </v-btn>
        </div>
      </v-slide-x-transition>
    </v-row>

    <v-row class="pt-5 pb-10 pa-15">
      <v-text-field
        v-model="user.username"
        name="username"
        label="Username"
        type="text"
        filled
        rounded
        outlined
        required
        color="info"
        clearable
        maxlength="15"
        counter
        :rules="[rules.required, rules.counter_max, rules.counter_min]"
        @keyup.enter="saveUsername"
      ></v-text-field>
    </v-row>

    <v-divider></v-divider>

    <v-card-actions class="d-flex justify-center align-center pa-3">
      <v-btn color="accent" text @click="saveUsername"> Validate </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "loginCard",
  data() {
    return {
      avatar: "",
      photo: "",
      saving: false,
      user: {
        id: 0,
        login: "",
        email: "",
        access_token: "",
        refresh_token: "",
        scope: "",
        expires_in: 0,
        created_at: 0,
        username: "" as string | null,
        avatar: "",
      },
      rules: {
        counter_max: (value: string | null) =>
          (value && value.length <= 15) || "Max 15 characters",
        counter_min: (value: string | null) =>
          (value && value.length >= 5) || "Min 5 characters",
        required: (value: string | null) => !!value || "Required",
      },
      sizeDialog: false,
    };
  },
  created: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        this.user = res.data;
        this.changeAvatar(res.data.avatar);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    hexToBase64(str: any) {
      return btoa(
        String.fromCharCode.apply(
          null,
          str
            .replace(/\r|\n/g, "")
            .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
            .replace(/ +$/, "")
            .split(" ")
        )
      );
    },
    selectImage() {
      this.photo = (this.$refs as HTMLFormElement).image.click();
    },
    imageSelected(e: { target: HTMLInputElement }) {
      if ((this.$refs as HTMLFormElement).image.files[0].size > 2097152)
        this.sizeDialog = true;
      else {
        const target = e.target as HTMLInputElement;
        this.$emit("input", target!.files![0]);
        this.photo = (this.$refs as HTMLFormElement).image.files[0];
        this.saving = true;
      }
    },
    async saveUsername() {
      console.log(this.user.username);
      this.$axios
        .post("/users/profile/update/username", {
          new_username: this.user.username,
        })
        .then((res) => {
          console.log(res);
        })
        .catch((error) => {
          console.error(error);
        });
      this.$router.push("/home");
    },
    async saveAvatar() {
      this.saving = false;
      let formdata = new FormData();
      formdata.append("file", this.photo);
      let config = {
        withCredentials: true,
        headers: {
          "content-type": "multipart/form-data; boundary=5e6wf59ew5f62ew",
        },
      };
      this.$axios
        .post("/users/profile/update/avatar", formdata, config)
        .then((res) => {
          console.log(res);
          this.changeAvatar(res.data.avatar);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    changeAvatar(filename: string) {
      this.avatar = `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
  },
});
</script>