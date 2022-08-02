<template>
  <div
    id="gameDetails"
    tyle="height: 80vh; max-height: 100%; row-gap: 50px"
    class="d-flex flex-column justify-center align-center"
  >
    <div class="d-flex align-center" style="column-gap: 20px">
      <GameRoomWinnerLooserCard
        :player="game_details.winner"
        title="WINNER"
        :score="game_details.score_winner"
        :level="game_details.level_winner"
        :xp="game_details.xp_winner"
      />
      <h1>VS</h1>
      <GameRoomWinnerLooserCard
        :player="game_details.looser"
        title="LOOSER"
        :score="game_details.score_looser"
        :level="game_details.level_looser"
        :xp="game_details.xp_looser"
      />
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
        console.log(res.data);
        this.game_details = res.data;
        console.log(this.game_details);
      })
      .catch((error) => {
        console.error(error);
      });
  },
});
</script>
