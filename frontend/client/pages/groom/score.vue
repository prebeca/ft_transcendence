<template>
  <div id="gameDetails" style="height: 80vh; max-height: 100%; row-gap: 50px"
    class="d-flex justify-center align-center">
    <div class="d-flex justify-center align-center" style="column-gap: 20px">
      <GameRoomWinnerLooserCard v-if="game_details.winner" :player="game_details.winner" title="WINNER"
        :score="game_details.score_winner" :username="game_details.username_winner" :level="game_details.level_winner"
        :xp="game_details.xp_winner" />
      <GameRoomWaitingCard v-else />
      <h1>VS</h1>
      <GameRoomWinnerLooserCard v-if="game_details.looser" :player="game_details.looser" title="LOOSER"
        :score="game_details.score_looser" :username="game_details.username_looser" :level="game_details.level_looser"
        :xp="game_details.xp_looser" />
      <GameRoomWaitingCard v-else />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "GameRoom",
  data() {
    return {
      game_details: {
        uuid: "",
        winner: {
          username: "",
          avatar: "",
          level: 0,
          mmr: 0,
          wins: 0,
          losses: 0,
          xp: 0,
        },
        looser: {
          username: "",
          avatar: "",
          level: 0,
          mmr: 0,
          wins: 0,
          losses: 0,
          xp: 0,
        },
        username_winner: "",
        username_looser: "",
        score_winner: 0,
        score_looser: 0,
        xp_winner: 0,
        xp_looser: 0,
        level_winner: 0,
        level_looser: 0,
        date: "",
        time: "",
      },
      roomid: "",
    };
  },
  created() {
    this.roomid = this.$route.query.name as string;
  },
  mounted() {
    this.$axios
      .get("/gameroom/details/" + this.roomid)
      .then((res) => {
        this.game_details = res.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
});
</script>
