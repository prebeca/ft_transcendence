<template>

    <tr 
        class="Match__item info--text"
        
    >
      
        <td>
            <div
                class="font-weight-medium text-uppercase"
            >{{ match.player1 }}</div>
            <div
                class="font-weight-medium text-uppercase"
            >{{ match.player2 }}</div>
        </td>

        <td>
            <div
                class="Match__score font-weight-medium"
            >
                {{ match.player1Score }}
            </div>
            <div
                class="Match__score font-weight-medium"
            >
                {{ match.player2Score }}
            </div>
        </td>

        <td>
            <v-icon v-if="match.player1Score > match.player2Score"
                color="success"
            >
                mdi-plus-box
            </v-icon>
            <v-icon v-else-if="match.player1Score < match.player2Score"
                color="accent"
            >
                mdi-minus-box
            </v-icon>
            <v-icon v-else
                color="grey"
            >
                mdi-equal-box
            </v-icon>
        </td>

    </tr>
    
</template>

<script>
import MatchHistoryCard from './MatchHistory.vue'

export default {
    name: "MatchItem",
    props: {
        match: {
          type: Object,
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