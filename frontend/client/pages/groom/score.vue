<template>
	<div id="gameDetails" style="height: 80vh; max-height: 100%; row-gap: 50px">
	</div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
	name: "GameRoom",
	data() {
		return {
			game_details: {
				winner: {
					username: "",
					avatar: "",
					level: 0,
					mmr: 0,
					wins: 0,
					losses: 0,
				},
				looser: {
					username: "",
					avatar: "",
					level: 0,
					mmr: 0,
					wins: 0,
					losses: 0,
				},
				score_winner: 0,
				score_looser: 0,
				date: "",
				time: "",
			},
			roomid: ""
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
