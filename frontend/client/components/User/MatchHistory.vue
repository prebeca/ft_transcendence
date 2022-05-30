<template>
  <v-card
    class="mx-auto"
    color="secondary"
    height="100px"
    outlined
  >

    <v-toolbar
      color="primary"
      height="15px"
      flat
    >
      <template v-slot:extension>
        <v-tabs
          v-model="tabs"
          centered
          color="info"
        >
          <v-tab
            v-for="n in 2"
            :key="n"
            class="font-weight-bold"
          >
            {{ tab[n - 1] }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabs">
      <v-tab-item>
        <v-card 
          flat
          color="secondary"
          class="py-10"
        >
        <v-simple-table
          class="secondary"
        >
          <template v-slot:default>
            <tbody>
              <tr
                v-for="match in matches"
                :key="match.player1"
                class="row-color"
              >
                <UserMatchItem :match="match" />
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        </v-card>
      </v-tab-item>
            <v-tab-item>
        <v-card 
          flat
          color="secondary"
        >
        <v-simple-table
          class="secondary"
        >
          <template v-slot:default>
            <tbody>
            </tbody>
          </template>
        </v-simple-table>

        </v-card>
      </v-tab-item>
    </v-tabs-items>

  </v-card>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MatchHistoryCard",
  data() {
    return {
      user: {
        avatar: "",
        username: "",
      },
      tabs: null,
      tab: ['Match History', 'Friends List'],
      matches: [
        {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 3,
        },
        {
          player1: 'player1',
          player2: 'player2',
          player1Score: 3,
          player2Score: 12,
        },
        {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 12,
        },
        {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 12,
        },
                {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 12,
        },
                {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 12,
        },
                {
          player1: 'player1',
          player2: 'player2',
          player1Score: 12,
          player2Score: 12,
        }
      ]
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
    changeAvatar(filename: string) {
      this.user.avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
  },
});
</script>

<style scoped>
  .row-color {
    display: table-row;
  }

  .row-color:hover {
    background: rgb(94, 53, 177) !important;
  }
</style>