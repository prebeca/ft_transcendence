<template>
    <v-card
    color="secondary"
    width="500px"
    max-height="550px"
    elevation="20"
    style="border-radius:25px"
    >
    <v-toolbar
     color="primary"
     class="d-flex justify-center"
    >
        <v-toolbar-title
         class="font-weight-black info--text"
         style="font-size: 25px"
        >
            EDIT YOUR PROFILE
        </v-toolbar-title>
    </v-toolbar>

    <v-row 
     class="pt-12"
     justify="center"
     align="center">
      <image-input v-model="avatar">
        <div slot="activator">
          <v-avatar size="150px" v-ripple v-if="!avatar" color="deep-purple">
            <span class="info--text">Click to change your avatar</span>
          </v-avatar>
          <v-avatar size="150px" v-ripple v-else class="mb-3">
            <img :src="avatar.imageURL" alt="avatar">
          </v-avatar>
        </div>
      </image-input>
    </v-row>

    <v-row
     justify="center">
      <v-slide-x-transition>
        <div v-if="avatar && saved == false">
          <v-btn text class="secondary" @click="uploadImage" :loading="saving">Save Avatar</v-btn>
        </div>
      </v-slide-x-transition>
    </v-row>

    <v-row
     justify="center"
     class="pt-10 pb-0 pa-15"
    >
        <v-text-field
         v-model="username"
         name="username"
         label="Change your username"
         type="text"
         filled
         rounded
         dense
         required
         color="info"
        ></v-text-field>
    </v-row>

    <v-row
     class="pb-6"
     justify="center"
    >
        <v-checkbox
         label="Use two-factor authentification"
         color="info"
        ></v-checkbox>
    </v-row> 

    <v-divider></v-divider>

    <v-card-actions
     class="d-flex justify-center align-center pa-3"
     >
      <v-btn
        color="accent"
        text
        @click="editProfil"
      >
        Validate
      </v-btn>
    </v-card-actions>
  </v-card>

</template>

<script lang="ts">

import  Vue from "vue"
import ImageInput from './ImageInput.vue' 

export default Vue.extend ({
  name: 'app',
  data () {
    return {
      avatar: null,
      saving: false,
      saved: false,
    }
  },
  components: {
    ImageInput: ImageInput
  },
  watch:{
    avatar: {
      handler: function() {
        this.saved = false
      },
      deep: true
    }
  },
  methods: {
    uploadImage() {
      this.saving = true
      setTimeout(() => this.savedAvatar(), 1000)
    },
    savedAvatar() {
      this.saving = false
      this.saved = true
    },
    editProfil() {
        this.$router.push('/home');
    }
  }
})
</script>