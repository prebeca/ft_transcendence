<template>
    <v-card color="secondary">
        <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
                <v-avatar size="120">
                    <v-img :src="avatar"></v-img>
                </v-avatar>
                <v-divider class="my-3"></v-divider>
                <v-btn to="/profile" depressed rounded text color="info">
                    Your Profile
                </v-btn>
                <v-divider class="my-3"></v-divider>
                <v-btn to="/edit-profile" depressed rounded text color="info">
                    Edit Your Profile
                </v-btn>
                <v-divider class="my-3"></v-divider>
                <v-btn to="/" depressed rounded text color="accent">
                    Log out
                </v-btn>
            </div>
        </v-list-item-content>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend ({
    name: 'UserCard',
    data () {
      return {
            avatar: '',
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
        changeAvatar(filename: string) {
			this.avatar = `${process.env.API_URL}/users/profile/avatar/` + filename;
	    }
    }
})
</script>