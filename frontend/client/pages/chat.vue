<template>
  <v-card color="secondary">
    <v-container>
      <v-row>
        <v-col cols="12" sm="3" class="border">
          <v-system-bar color="secondary" class="mt-5">
            <v-btn max-width="50px" tile color="purple" x-large block>
              <v-icon left color="white">mdi-plus</v-icon>
              <v-divider class="mx-3" vertical></v-divider>
              New Channel
            </v-btn>
          </v-system-bar>

          <v-system-bar flat color="secondary" class="my-6">
            <v-spacer></v-spacer>
          </v-system-bar>

          <v-system-bar flat color="secondary" class="my-6">
            <v-text-field
              filled
              label="Search Here"
              append-icon="mdi-magnify"
              color="grey"
            ></v-text-field>
          </v-system-bar>

          <v-list color="secondary">
            <v-list-item-group v-model="selected" active-class="blue lighten-4">
              <template v-for="(user, index) in users">
                <v-list-item :key="user.id" class="my-2">
                  <UserAvatarStatus :user="user" size="50px" offset="15" />
                  <template>
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="user.username"
                        class="ml-10"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-item>

                <v-divider
                  v-if="index < users.length - 1"
                  :key="index"
                ></v-divider>
              </template>
            </v-list-item-group>
          </v-list>
        </v-col>

        <v-col cols="12" sm="6" class="border">
          <v-system-bar class="mt-5" color="secondary" flat>
            <v-toolbar-title class="title pl-0 ml-2 mt-n4">
              Channel
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="black" icon class="mt-n5">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-system-bar>

          <v-system-bar flat color="secondary" class="my-6">
            <v-spacer></v-spacer>
          </v-system-bar>

          <v-app-bar color="rgba(0,0,0,0)" flat>
            <v-text-field
              v-model="message"
              :append-outer-icon="message ? 'mdi-send' : ''"
              filled
              clear-icon="mdi-close-circle"
              clearable
              label="Message"
              type="text"
              @click:append-outer="sendMessage"
              @click:clear="clearMessage"
            ></v-text-field>
          </v-app-bar>
        </v-col>
        <v-col cols="12" sm="3"> </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data: () => ({
    selected: [2],
    users: [
      {
        id: "",
        username: "",
        avatar: "",
      },
    ],
    panel: [2],

    password: "Password",
    show: false,
    message: "Type a message here",
    marker: true,
    iconIndex: 0,
  }),
  created: function () {
    this.$axios
      .get("/users")
      .then((res) => {
        console.log(res.data);
        this.users = res.data;
        for (let i = 0; i < this.users.length; i++)
          this.changeAvatar(res.data[i].avatar, i);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  computed: {},
  methods: {
    sendMessage() {
      this.resetIcon();
      this.clearMessage();
    },
    clearMessage() {
      this.message = "";
    },
    resetIcon() {
      this.iconIndex = 0;
    },
    changeAvatar(filename: string, i: number) {
      this.users[i].avatar =
        `${process.env.API_URL}/users/profile/avatar/` + filename;
    },
  },
});
</script>

<style scoped>
.border {
  border-right: 1px solid grey;
}
</style>