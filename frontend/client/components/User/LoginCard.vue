<template>
	<v-card
	color="secondary"
	width="800px"
	max-height="700px"
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
		<image-input>
			<div slot="activator">
			<v-avatar size="150px" v-ripple class="mb-3">
				<img :src="avatar" alt="avatar">
			</v-avatar>
			</div>
		</image-input>
		</v-row>
		<v-row
		justify="center"
		align="center">
			<v-text-field
			name="photo"
			outline
			background-color="blue"
			color="blue"
			label="Select image"
			@click="selectImage"/>
			<input
			ref="image"
			class="hide-input"
			type="file"
			accept="image/*"
			@change="imageSelected">
		</v-row>
		<v-row
			justify="center">
			<v-btn
				class="upload-button"
				color="indigo"
				@click="saveAvatar">
				Upload
				<v-icon
				right
				color="white">
				</v-icon>
			</v-btn>
		</v-row>
		<v-row
		 justify="center">
			<v-slide-x-transition>
				<div v-if="avatar && saved == false">
					<v-btn text class="secondary" @click="saveAvatar" :loading="saving">Save Avatar</v-btn>
				</div>
			</v-slide-x-transition>
		</v-row>

		<v-row
		 class="pt-10 pb-10 pa-15"
		>
			<v-text-field
				v-model="username"
				name="username"
				:label="user.username"
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
				@click="saveUsername"
			>
				Validate
			</v-btn>
		</v-card-actions>
	</v-card>

</template>

<script lang="ts">
import Vue from 'vue';
import ImageInput from './ImageInput.vue' ;
Vue.use(VueCookies);

export default Vue.extend ({
	name: 'loginCard',
	data() {
		return {
			avatar: '',
			photo: '',
			saving: false,
			saved: false,
			username: "",
			user: {
				id: 0,
				login: "",
				email: "",
				access_token: "",
				refresh_token: "",
				scope: "",
				expires_in: 0,
				created_at: 0,
				username: "",
				avatar: "",
			},
		}
	},
	created: function() {
		this.$axios.get('/users/profile')
		.then((res) => {
			console.log(res.data);
			this.user = res.data;
			this.changeAvatar(res.data.avatar);
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
		hexToBase64(str: any){
 	   		return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
		},
		selectImage() {
			this.photo = (this.$refs as HTMLFormElement).image.click()
		},
		imageSelected(e: { target: HTMLInputElement; }) {
			const target = e.target as HTMLInputElement;
			this.$emit('input', target!.files![0]);
			this.photo = (this.$refs as HTMLFormElement).image.files[0];
		},
		uploadImage() {
			this.saving = true
			setTimeout(() => this.savedAvatar(), 1000)
		},
		savedAvatar() {
			this.saving = false
			this.saved = true
		},
		async saveUsername() {
			const { username } = this;
			this.user.username = username;
			console.log(this.user.username);
			this.$axios.post('/users/profile/update/username', {new_username: this.user.username})
			.then((res) => {
				console.log(res)
			})
			.catch((error) => {
				console.error(error)
			});
		},
		async saveAvatar() {
			let formdata = new FormData();
			formdata.append('file', this.photo);
			let config = {
				withCredentials: true,
				headers: {
			        'content-type': 'multipart/form-data; boundary=5e6wf59ew5f62ew'
				}
			}
			this.$axios.post('/users/profile/update/avatar', formdata, config)
			.then((res) => {
				console.log(res)
				this.changeAvatar(res.data.avatar);
			})
			.catch((error) => {
				console.error(error)
			});
		},
		changeAvatar(filename: string) {
			this.avatar = `${process.env.API_URL}/users/profile/avatar/` + filename;
		}
	},
});
</script>
