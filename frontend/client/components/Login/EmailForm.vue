<template>
  <v-dialog 
    v-model="dialog" 
    persistent 
    max-width="600px" 
    min-width="360px"
  >
    <div>
      <v-tabs 
        v-model="tab" 
        show-arrows 
        background-color="primary" 
        icons-and-text 
        grow
      >
        <v-tabs-slider color="accent"></v-tabs-slider>
          <v-tab>
            <v-icon large>{{ tabs[0].icon }}</v-icon>
            <div class="caption py-1">{{ tabs[0].name }}</div>
          </v-tab>
          <v-tab>
            <v-icon large>{{ tabs[1].icon }}</v-icon>
            <div class="caption py-1">{{ tabs[1].name }}</div>
          </v-tab>
          <v-tab-item>
            <v-card 
              class="px-4"
              color="secondary"
            >
              <v-card-text>
                <v-form 
                  ref="loginForm" 
                  v-model="valid" 
                  lazy-validation
                >
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="loginEmail" 
                        :rules="loginEmailRules" 
                        label="E-mail" 
                        required
                        color="info"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field 
                          v-model="loginPassword" 
                          :append-icon="show1?'eye':'eye-off'" 
                          :rules="[rules.required, rules.min]" 
                          :type="show1 ? 'text' : 'password'" 
                          name="input-10-1" 
                          label="Password" 
                          hint="At least 8 characters" 
                          counter 
                          @click:append="show1 = !show1"
                          color="info"
                        ></v-text-field>
                    </v-col>
                    <v-col 
                      class="d-flex" 
                      cols="12" 
                      ></v-col>
                    <v-spacer></v-spacer>
                    <v-col 
                      class="d-flex ml-auto" 
                      cols="12" 
                      sm="3"
                      xsm="12"
                      align-end
                    >
                        <v-btn 
                          x-large block 
                          :disabled="!valid" 
                          color="success" 
                          @click="validateLogin"
                        > Login </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card 
              class="px-4"
              color="secondary"
            >
              <v-card-text>
                <v-form 
                  ref="registerForm" 
                  v-model="valid" 
                  lazy-validation
                >
                  <v-row>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="username" 
                        :rules="[rules.required]" 
                        label="Username" 
                        maxlength="20" 
                        required
                        color="info"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="email" 
                        :rules="emailRules" 
                        label="E-mail" 
                        required
                        color="info"
                    ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field 
                        v-model="password" 
                        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" 
                        :rules="[rules.required, rules.min]" 
                        :type="show1 ? 'text' : 'password'" 
                        name="input-10-1" 
                        label="Password" 
                        hint="At least 8 characters" 
                        counter 
                        @click:append="show1 = !show1"
                        color="info"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field 
                        block 
                        v-model="verify" 
                        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" 
                        :rules="[rules.required, passwordMatch]" 
                        :type="show1 ? 'text' : 'password'" 
                        name="input-10-1" 
                        label="Confirm Password" 
                        counter 
                        @click:append="show1 = !show1"
                        color="info"
                      ></v-text-field>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col 
                      class="d-flex ml-auto" 
                      cols="12" 
                      sm="3" 
                      xsm="12"
                    >
                      <v-btn 
                        x-large 
                        block 
                        :disabled="!valid" 
                        color="success" 
                        @click="validateRegister"
                      >Register</v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-tab-item>
      </v-tabs>
    </div>
  </v-dialog>

</template>


<script lang="ts">
import Vue from 'vue';

export default Vue.extend ({
  
	name: 'loginForm',

  data: () => ({
    dialog: true,
    tab: 0,
    tabs: [
        {name:"Login", icon:"mdi-account"},
        {name:"Register", icon:"mdi-account-outline"}
    ],
    valid: true,
    
    username: "",
    email: "",
    password: "",
    verify: "",
    loginPassword: "",
    loginEmail: "",
    loginEmailRules: [
      v => !!v || "Required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],
    emailRules: [
      v => !!v || "Required",
      v => /.+@.+\..+/.test(v) || "E-mail must be valid"
    ],

    show1: false,
    rules: {
      required: value => !!value || "Required.",
      min: v => (v && v.length >= 8) || "Min 8 characters"
    }
  }),
  computed: {
    passwordMatch() {
      return () => this.password === this.verify || "Password must match";
    }
  },
  methods: {
    validateLogin() {
      this.$axios.post('/auth/login', {email: this.loginEmail, password: this.loginPassword})
			.then((res) => {
				console.log(res);
        this.$router.push("login");
			})
			.catch((error) => {
				console.error(error)
			});
    },
    validateRegister() {
      this.$axios.post('/auth/register', {username: this.username, email: this.email, password: this.password})
			.then((res) => {
				console.log(res)
			})
			.catch((error) => {
				console.error(error)
			});
    },
  },
});
</script>