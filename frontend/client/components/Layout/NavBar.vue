<template>
    
    <v-app-bar app color="primary">

        <v-toolbar-title v-text="title" class="info--text"/>

        <v-spacer></v-spacer>

        <v-menu bottom min-width="200px" rounded offset-y>

            <template v-slot:activator="{ on }">
                <v-btn icon x-large v-on="on">
                    <v-avatar>
                        <v-img :src="avatar"></v-img>
                    </v-avatar>
                </v-btn>
            </template>

            <LayoutUserCard />

        </v-menu>

    </v-app-bar>

</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend ({
    name: 'NavBar',
    data () {
      return {
            title: 'PONG GAME',
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