<template>
  <tr class="Match__item info--text">
    <td>
      <div class="font-weight-medium text-uppercase">
        {{ date }}
      </div>
    </td>

    <td>
      <div class="font-weight-medium text-uppercase">
        {{ player1_username }}
      </div>
      <div class="font-weight-medium text-uppercase">
        {{ player2_username }}
      </div>
    </td>

    <td>
      <div class="Match__score font-weight-medium">
        {{ player1_score }}
      </div>
      <div class="Match__score font-weight-medium">
        {{ player2_score }}
      </div>
    </td>

    <td>
      <v-icon v-if="player1_score > player2_score" color="success">
        mdi-plus-box
      </v-icon>
      <v-icon v-else-if="player1_score < player2_score" color="accent">
        mdi-minus-box
      </v-icon>
      <v-icon v-else color="grey"> mdi-equal-box </v-icon>
    </td>
  </tr>
</template>

<script>
// import MatchHistoryCard from "./MatchHistory.vue";

export default {
  name: "MatchItem",
  props: {
    player1_score: {
      type: Number,
      required: true,
    },
    player2_score: {
      type: Number,
      required: true,
    },
    player1_username: {
      type: String,
      required: true,
    },
    player2_username: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.Match__item {
  align-items: center;
  display: flex;
  justify-content: space-around;
  margin: 0.5rem 0;
  padding: 0.25rem;
}

.Match__score {
  text-align: right;
}
</style>