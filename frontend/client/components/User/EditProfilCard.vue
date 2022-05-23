<template>
    <v-card
      color="secondary"
      width="500px"
      max-height="650px"
      elevation="20"
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
			class="pt-12 pb-2"
			justify="center"
			align="center"
		>
      <v-avatar 
		  	size="180px" 
			  class="mb-3"
		  >
        <img :src="avatar" alt="avatar">
      </v-avatar>
		</v-row>

		<v-row justify="center">
			<input
				ref="image"
				type="file"
				accept="image/*"
				@change="imageSelected"
				style="display: none"
			>
			<v-btn
				color="info"
				@click="selectImage"
				text
			>
				SELECT AN IMAGE 
			</v-btn>
		</v-row>

		<v-row
			justify="center"
			class="py-5"
		>
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

		<v-row
		 class="py-5 pa-15"
		>
			<v-text-field
				v-model="user.username"
				name="username"
				label="Change your username"
				type="text"
				filled
				rounded
				outlined
				required
				color="info"
				clearable
				maxlength="15"
				counter
				:rules="[rules.counter_max, rules.counter_min]"
			></v-text-field>
		</v-row>

    <v-row
     class="pb-6"
     justify="center"
    >
        <v-checkbox
		 v-model="user.twofauser"
		ref="istwofa"
		 name="istwofa"
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

export default Vue.extend ({
	name: 'loginCard',
	data() {
		return {
			avatar: '',
			photo: '',
			username: '',
			saving: false,
			istwofa: '',
			user: {
				username: "",
				avatar: "",
				twofauser: false,
			},
			rules: {
				counter_max: value => value.length <= 15 || 'Max 15 characters',
				counter_min: value => value.length >= 5 || 'Min 5 characters',
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
	methods: {
		/*selectIsTwoFa(){
			this.istwofa = (this.$refs as HTMLFormElement).istwofa;
			if (this.user.twofauser){
				this.istwofa.aria-checked = true
			}
			else{
				this.istwofa.aria-checked = false
			}
		},*/
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
			this.saving = true;
		},
		async saveUsername() {
			 const { username } = this;
      		console.log(this.user.username);
			console.log(this.user.username);
			this.$axios.post('/users/profile/update/username', {new_username: this.user.username})
			.then((res) => {
				console.log(res)
			})
			.catch((error) => {
				console.error(error)
			});
			this.$router.push('/home');
		},
		async saveAvatar() {
			this.saving = false;
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