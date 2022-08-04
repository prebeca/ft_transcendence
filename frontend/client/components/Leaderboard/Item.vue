<template>
  <tr class="leaderboard__item">
    <td class="leaderboard__index">{{ index + 1 }}</td>
    <router-link :to="userProfile" class="text-decoration-none">
      <UserAvatarStatus :size="sizeOfAvatar" :user="user" :offset="20" />
    </router-link>
    <td class="leaderboard__user">{{ user.username }}</td>
    <div v-if="!isUser">
      <v-btn v-if="isFriend === false" text color="green" @click="addFriend"
        >add Friend</v-btn
      >
      <v-btn v-else text color="error" @click="removeFriend"
        >remove Friend</v-btn
      >
    </div>
    <v-spacer></v-spacer>
    <td class="leaderboard__text">level</td>
    <td class="leaderboard__level">
      {{ user.player.level }}
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "LeaderboardItem",
  data() {
    return {
      sizeOfAvatar: "60px",
      isFriend: false,
      isUser: false,
      thisUser: {
        id: "",
        friends: [
          {
            type: Object,
            id: "",
          },
        ],
      },
    };
  },
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
  mounted: function () {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        this.thisUser = res.data;
        if (this.thisUser.id === this.user.id) {
          this.isUser = true;
        }
        for (let i = 0; i < this.thisUser.friends.length; i++) {
          if (this.thisUser.friends[i].id === this.user.id)
            this.isFriend = true;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    async addFriend() {
      this.$axios
        .post("/friends/add", {
          user_id_to_add: this.user.id,
        })
        .then((res) => {
          this.isFriend = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async removeFriend() {
      await this.$axios
        .post("/friends/remove", {
          user_id_to_remove: this.user.id,
        })
        .then((res) => {
          this.isFriend = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  computed: {
    userProfile(): string {
      return `/profile/${this.user.id}`;
    },
  },
});
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
