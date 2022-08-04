<template>
	<v-card class="mx-auto" color="secondary" height="100px" outlined>
		<v-toolbar color="primary" height="15px" flat>
			<template v-slot:extension>
				<v-tabs v-model="tabs" centered color="info">
					<v-tab v-for="n in 2" :key="n" class="font-weight-bold">
						{{ tab[n - 1] }}
					</v-tab>
				</v-tabs>
			</template>
		</v-toolbar>

		<v-tabs-items v-model="tabs">
			<v-tab-item>
				<v-card flat color="secondary" class="py-10">
					<v-simple-table class="secondary">
						<template v-slot:default>
							<tbody>
								<tr v-for="match in matches" :key="match.player1" class="row-color">
									<UserMatchItem :match="match" />
								</tr>
							</tbody>
						</template>
					</v-simple-table>
				</v-card>
			</v-tab-item>

			<v-tab-item color="secondary">
				<v-card flat color="secondary">
					<v-simple-table class="secondary">
						<template v-slot:default>
							<v-row class="my-10 mx-2">
								<v-col v-for="(friend, index) in friends" :key="index"
									class="d-flex align-content-space-around justify-space-around" cols="4">
									<UserFriendCard :friend="friend" />
								</v-col>
							</v-row>
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
	props: {
		user: {
			type: Object,
			required: true,
		},
		friends: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			tabs: null,
			tab: ["Match History", "Friends List"],
			matches: [
				{
					winner: "player1",
					looser: "player2",
					winner_score: 12,
					looser_score: 3,
				},
			],
		};
	},
	mounted: function () {
		this.$axios
			.get("/game/history") // -> new endpoint (returns history of games from current user)
			.then((res) => {
				console.log(res);
			})
			.catch((error) => {
				console.error(error);
			});
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

.v-window {
	background-color: rgb(81, 45, 168) !important;
}
</style>