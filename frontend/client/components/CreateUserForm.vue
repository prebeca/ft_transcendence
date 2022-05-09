<template>
	<v-form ref="form" v-model="valid" lazy-validation>
		<v-text-field
			v-model="username"
			:counter="20"
			:rules="nameRules"
			label="Name"
			required
		></v-text-field>

		<v-text-field
			v-model="email"
			:rules="emailRules"
			label="E-mail"
			required
		></v-text-field>

		<v-text-field
		v-model="password"
			:rules="passwordRules"
		type="password"
		label="Password" 
		required
	></v-text-field>

		<v-btn :disabled="!valid" color="success" class="mr-4" @click="validate">
			Validate
		</v-btn>

		<v-btn color="error" class="mr-4" @click="reset"> Reset Form </v-btn>
	</v-form>
</template>

<script>
export default {
	data: () => ({
		valid: true,
		username: "",
		nameRules: [
		(v) => !!v || "Name is required",
			(v) => (v && v.length <= 20) || "Name must be less than 10 characters",
		],
		email: "",
		emailRules: [
		(v) => !!v || "E-mail is required",
			(v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
		],
	password: "",
		passwordRules: [
		(v) => !!v || "Password is required",
			(v) => (v && v.length >= 8) || "password must be more than 8 characters",
		],
	}),
	methods: {
		async validate() {
			if (this.$refs.form.validate()) {
				await fetch("http://localhost:3000/users/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						username: this.username,
						email: this.email
					}),
				}).then((res) => res.json());
			}
		},
		reset() {
			this.$refs.form.reset();
		},
	},
};
</script>