<template>
  <tr class="leaderboard__item">
    <td class="leaderboard__index">{{ index + 1 }}</td>
    <v-avatar size="60px" class="m-10 mr-5">
      <img :src="user.avatar" alt="avatar" />
    </v-avatar>
    <td class="leaderboard__user">{{ user.username }}</td>
    <v-btn text color="accent">add Friend</v-btn>
    <v-spacer></v-spacer>
    <td class="leaderboard__text">level</td>
    <td class="leaderboard__level">
      {{ user.player.level }}
    </td>
  </tr>
</template>

<script>
import Vue from "vue";
import leaderboardVue from "../../pages/leaderboard.vue";

export default {
  name: "LeaderboardItem",
  props: {
    user: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.leaderboard__item {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.25rem;
}
.leaderboard__index {
  text-align: left;
  width: 10%;
  margin-left: 30px;
}
.leaderboard__user {
  text-align: left;
  width: 20%;
  margin-left: 20px;
}
.leaderboard__text {
  text-align: right;
  width: 10%;
}
.leaderboard__level {
  text-align: right;
  width: 10%;
  margin-right: 20px;
}
</style>
