<template>

    <div style="height: 100vh; max-height: 100%;" class="d-flex justify-center">
        
        <v-card
         color="secondary"
		 width="500px"
		 max-height="800px"
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
				    LEADERBOARD
				</v-toolbar-title>
            </v-toolbar>

            <div class="leaderboard" v-if="users.length > 0">
                <div
                 :key="user.login"
                 v-for="(user, index) in sortedUsers"
                >
                    <LeaderboardItem :user="user" />
                    <v-divider
                     v-if="index < users.length -1"
                     :key="`${index}-divider`">
                    </v-divider>
                </div>
            </div>

            <p class="message" v-else>Nothing to show</p>

        </v-card>

    </div>
    
</template>

<script lang="ts">

import Vue from 'vue'

export default Vue.extend({

    data() {
		return {
			users: [
                {
                    login: 'user1',
                    level: 5,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user2',
                    level: 9,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user3',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user4',
                    level: 1,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user5',
                    level: 6.2,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user6',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
            ]
		}
	},
    computed: {
        sortedUsers() {
            return [...this.users].sort((a, b) => 
                a.level === b.level
                    ? a.login.localeCompare(b.login)
                    : a.level > b.level
                    ? -1
                    : 1
            );
        },
    },
})
</script>

<style scoped>

.leaderboard {
    font-family: Arial, Helvetica, sans-serif;
    list-style: none;
    margin: auto 0;
    padding: 2rem;
    width: 30rem;
}

.message {
    padding: 2rem;
    text-align: center;
}
</style>