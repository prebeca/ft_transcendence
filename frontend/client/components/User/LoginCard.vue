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
				COMPLETE YOUR PROFILE
				</v-toolbar-title>
		</v-toolbar>
    <v-row 
     class="pt-12 pb-2"
     justify="center"
     align="center">
      <image-input v-model="avatar">
        <div slot="activator">
          <v-avatar size="150px" v-ripple v-if="avatar" class="mb-3">
            <img :src="avatar.imageURL" alt="avatar">
          </v-avatar>
          <v-avatar size="150px" v-ripple v-else-if="users[0]" class="mb-3">
            <img :src="users[0].image_url" alt="avatar">
          </v-avatar>
          <v-avatar size="150px" v-ripple v-else color="deep-purple">
            <span>hello</span>
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
		 class="pt-10 pb-10 pa-15"
		>
				<v-text-field
				 v-model="username"
				 name="username"
				 label="username"
				 type="text"
				 filled
				 rounded
				 dense
				 required
				 color="info"
				></v-text-field>
		</v-row>  

		<v-divider></v-divider>

		<v-card-actions
		 class="d-flex justify-center align-center pa-3"
		 >
			<v-btn
				color="accent"
				text
				@click="logIn"
			>
				Validate
			</v-btn>
		</v-card-actions>
	</v-card>

</template>

<script lang="ts">
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import ImageInput from './ImageInput.vue' ;
import axios from 'axios';
Vue.use(VueCookies);

export default Vue.extend ({
  layout: 'empty',
  name: 'IndexPage',
  data () {
	return {
		avatar: null,
		saving: false,
		saved: false,
		username: "",
		registered: false,
		users: [],
	}
  },
  async fetch () {
		axios.get('http://localhost:3000/profile', {
			withCredentials: true,
		})
		.then((res) => {
			console.log(res.data)
		})
		.catch((error) => {
			console.error(error)
		});
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
		logIn() {
			const { username } = this;
			
			this.users[0].username = username;
			this.users[0].image_url = this.avatar;
			
		}
	},
});
</script>