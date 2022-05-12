<template>

    <div class="leaderboard__item">
        <span class="leaderboard__user">{{ user.login }}</span>
        <v-spacer></v-spacer>
        <span class="leaderboard__level">Level</span>
        <span class="leaderboard__level">
            {{ user.level }} 
        </span>
    </div>
    
</template>

<script>
import leaderboardVue from '../../pages/leaderboard.vue'

export default {
    name: "LeaderboardItem",
    props: {
        user: {
            type: Object,
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
.leaderboard__user {
  text-align: left;
  width: 30%;
}
.leaderboard__level {
  text-align: right;
  width: 10%;
}

</style>
