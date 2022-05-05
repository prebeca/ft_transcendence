<template>
	<div>
		<create-user-form />
		<br />
		<v-card class="mx-auto" max-width="400" tile @click.stop="refresh()">
			<v-btn icon color="green">
				<v-icon>mdi-cached</v-icon>
			</v-btn>
			<v-list-item four-line v-for="(item, i) in items" :key="i">
				<v-list-item-content>
					<v-list-item-title v-text="item.username"></v-list-item-title>
					<v-list-item-subtitle v-text="item.email"></v-list-item-subtitle>
					<v-btn color="primary"	depressed v-on:click="deleteUser(item.id)" >
						<v-icon left> mdi-account-box </v-icon>
					</v-btn>
					<v-btn color="error"	depressed v-on:click="deleteUser(item.id)" >
						<v-icon left> mdi-delete </v-icon>
					</v-btn>
				</v-list-item-content>
			</v-list-item>
		</v-card>
		<div>
			<v-btn color="error" depressed @click.stop="deleteAll()" >
			<v-icon left> mdi-delete </v-icon>
				Delete All Users
			</v-btn>
			<v-btn color="primary"	depressed @click.stop="addMembersOfGroup()" >
			<v-icon left> mdi-plus </v-icon>
				Add our four members
			</v-btn>
		</div>
	</div>
</template>

<script lang="ts">
import CreateUserForm from "../components/CreateUserForm.vue";
import  Vue from "vue"
export default  Vue.extend ({
	components: { CreateUserForm },
	data() {
		return {
			items: []
		}
	},
	async fetch() {
		this.items = await fetch("http://localhost:3000/users").then((res) =>
			res.json()
		);
	},
	methods: {
		async refresh() {
			this.items = await fetch("http://localhost:3000/users").then(
				(res) => res.json()
			);
		},
		async deleteAll() {
			await fetch("http://localhost:3000/users/deleteall");
			this.items = await fetch("http://localhost:3000/users").then(
				(res) => res.json()
			);
		},
		async deleteUser(id: string) {
			await fetch("http://localhost:3000/users/delete/" + id);
			this.items = await fetch("http://localhost:3000/users").then(
				(res) => res.json()
			);
		},
		async addMembersOfGroup() {
			await fetch("http://localhost:3000/users/addGroup/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify([{
						username: 'avogt',
						email: 'avogt@student.42.fr',
						password: '12345678',
					},
					{
						username: 'tpierre',
						email: 'tpierre@student.42.fr',
						password: '123456789',
					},
					{
						username: 'afoulq',
						email: 'afoulq@student.42.fr',
						password: '123456789',
					},
					{
						username: 'prebeca',
						email: 'prebeca@student.42.fr',
						password: '123456789',
					},
					{
						username: 'john',
						email: 'john@student.42.fr',
						password: 'changeme',
					},
					]),
			}).then((res) => res.json());
			this.items = await fetch("http://localhost:3000/users").then(
				(res) => res.json()
			);
		}
	},
});
</script>