<template>
  <div>
    <create-user-form />
    <br />
    <v-card class="mx-auto" max-width="400" tile @click.stop="refresh()">
      <v-btn icon color="green">
        <v-icon>mdi-cached</v-icon>
      </v-btn>
      <v-list-item two-line v-for="(item, i) in items" :key="i">
        <v-list-item-content>
          <v-list-item-title v-text="item.username"></v-list-item-title>
          <v-list-item-subtitle v-text="item.email"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script lang="ts">
import CreateUserForm from "../components/CreateUserForm.vue";
export default {
  components: { CreateUserForm },
  data() {
    return {
      items: [],
    };
  },
  async fetch() {
    this.items = await fetch("http://localhost:3000/users/users").then((res) =>
      res.json()
    );
  },

  methods: {
    async refresh() {
      this.items = await fetch("http://localhost:3000/users/users").then(
        (res) => res.json()
      );
    },
  },
};
</script>
