<template>

    <div 
      style="max-height: 100%;"
      class="d-flex justify-center"
    >

    <v-card
      class="mt-15"
      color="secondary"
		  elevation="20"
      max-height="100%"
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

        <v-simple-table
          height="50rem"
          class="leaderboard secondary"
        >
          <template v-slot:default>
            <tbody>
              <tr
                v-for="(user, index) in sortedUsers"
                :key="user.login"
                class="row-color"
              >
                <LeaderboardItem :user="user" :index="index"/>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

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
                {
                    login: 'user7',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                                {
                    login: 'user8',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                                {
                    login: 'user9',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                {
                    login: 'user10',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                                {
                    login: 'user10',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                                {
                    login: 'user10',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
                                {
                    login: 'user10',
                    level: 8.4,
                    image_url: '/avatar.png'
                },
            ]
		}
	},
    computed: {
        sortedUsers: function (): object {
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
    margin: auto 0;
    padding: 2rem;
    width: 800px;
    max-height: 100%;
}

.message {
    padding: 2rem;
    text-align: center;
}

.row-color {
  display: table-row;
}

.row-color:hover {
  background: rgb(94, 53, 177) !important;
}
</style>