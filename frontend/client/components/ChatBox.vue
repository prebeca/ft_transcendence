<template>
  <v-card class="pa-2" min-height="200" min-width="400">
    <v-row>
      <v-col cols="9">
        <v-text-field
          label="join/create channel"
          solo
          v-model="channel_input"
        ></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn
          class="mx-2"
          fab
          dark
          medium
          color="blue"
          v-on:click="privateMessage"
        >
          <v-icon dark> mdi-chat-plus </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="9">
        <v-select
          :items="channels_name"
          label="Channels"
          v-model="channel"
          solo
          @input="changeMessages"
        ></v-select>
      </v-col>
      <v-col cols="1">
        <v-btn class="mx-2" fab dark medium color="red" v-on:click="addChannel">
          <v-icon dark> mdi-chat-remove </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-card id="chat" height="400" class="scroll">
      <li v-for="(message, index) in messages_items" style="list-style: none">
        <p>{{ message.user_name }}: {{ message.content }}</p>
      </li>
    </v-card>
    <v-row>
      <v-col cols="9">
        <v-textarea
          ref="textArea"
          filled
          auto-grow
          label="Message"
          rows="2"
          row-height="15"
          v-model="message_input"
          v-on:keyup.enter="sendMessage"
        ></v-textarea>
      </v-col>
      <v-col cols="1">
        <v-btn
          class="mx-2"
          fab
          dark
          medium
          color="purple"
          v-on:click="sendMessage"
        >
          <v-icon dark> mdi-send </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Channel } from "diagnostics_channel";
import { log } from "util";
interface Message {
  target_id: number;
  user_id: number;
  user_name: number;
  content: string;
}
interface Channel {
  id: number;
  name: string;
  messages: Message[];
}
export default {
  data: () => ({
    user: {},
    channels_name: [] as string[],
    channels: [] as Channel[],
    messages_items: [] as Message[],
    message_input: "",
    channel: "" as string,
    channel_input: "",
  }),

  async created() {
    // fetch users profile
    await this.$axios
      .get("/users/profile")
      .then((res) => {
        this.user = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    // fetch users channels
    await this.$axios
      .get("/users/channels")
      .then((res) => {
        this.channels = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    // fetch channels messages
    for (let i = 0; i < this.channels.length; i++) {
      this.channels[i].messages = [];
      await this.$axios
        .get("channels/" + this.channels[i].id + "/messages")
        .then((res) => {
          this.channels[i].messages = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
      this.channels_name.push(this.channels[i].name);
    }

    // setup client socket
    this.socket = this.$nuxtSocket({ name: "chat", withCredentials: true });

    this.socket.emit("SetSocket");

    this.socket.on("connect", async (msg, cb) => {
      console.log("Connection !");
      this.joinChannels();
    });

    this.socket.on("disconnect", async (msg, cb) => {
      console.log("Disconnection !");
      this.leaveChannels();
    });

    this.socket.on("PrivateMessage", async (msg, cb) => {
      console.log(msg.user_name + ": " + msg.content);
    });

    this.socket.on("NewMessage", async (msg, cb) => {
      console.log("New message received !");
      if (msg != null) {
        this.channels
          .find((e) => {
            return e.id == msg.target_id;
          })
          ?.messages.push(msg);
        if (document.getElementById("chat").lastChild != null)
          document.getElementById("chat").lastChild.scrollIntoView(false);
      }
    });
  },

  methods: {
    async joinChannels() {
      for (let i = 0; i < this.channels.length; ++i) {
        this.socket.emit(
          "JoinChan",
          {
            target_id: this.channels[i].id,
            content: "",
          },
          (rep) => {
            if (rep != null) console.log("chan joined");
            else console.log("cannot join chan");
          }
        );
      }
    },

    async leaveChannels() {
      for (let i = 0; i < this.channels.length; ++i) {
        this.socket.emit("LeaveChan", {
          target_id: this.channels[i].id,
          content: "",
        });
      }
    },

    async addChannel() {
      if (this.channel_input.length == 0) return;

      await this.$axios
        .post(
          "/channels/create",
          {
            name: this.channel_input,
            scope: "public",
            password: "asd asdasd",
          },
          {
            "Content-Type": "application/json",
          }
        )
        .then(async (res) => {
          this.socket.emit(
            "JoinChan",
            {
              target_id: res.data.id,
              content: "",
            },
            (rep) => {
              if (rep != null) console.log("chan joined");
              else console.log("cannot join chan");
            }
          );
          res.data.messages = [];
          await this.$axios
            .get("channels/" + res.data.id + "/messages")
            .then((res2) => {
              res.data.messages = res2.data;
            })
            .catch((error) => {
              console.error(error);
            });
          this.channels.push(res.data);
          this.channels_name.push(res.data.name);
        })
        .catch((error) => {
          console.error(error);
        });
      this.channel_input = "";
    },

    async changeMessages() {
      let channel = this.channels.find((e) => {
        return e.name === this.channel;
      });
      if (channel == undefined) return;
      this.messages_items = channel.messages;
    },

    async sendMessage() {
      if (this.message_input.length == 0) return;
      if (this.channels.length == 0) return;
      if (this.channel.length == 0) return;

      let channel = this.channels.find((e) => {
        return e.name == this.channel;
      });

      if (channel == undefined) return;

      console.log("message sent");

      await this.socket.emit("NewMessage", {
        target_id: channel.id,
        content: this.message_input,
      });
      this.message_input = "";
    },

    async privateMessage() {
      if (this.channel_input.length == 0) return;
      this.socket.emit("PrivateMessage", {
        target_id: 5,
        content: this.message_input,
      });
      this.channel_input = "";
    },
  },
};
</script>


<style lang="css" scoped>
html {
  overflow: hidden !important;
}

.v-card {
  display: flex !important;
  flex-direction: column;
}
.scroll {
  overflow-y: scroll;
}
</style>