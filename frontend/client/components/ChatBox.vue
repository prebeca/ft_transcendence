<template>
  <v-card class="pa-2" min-height="200" min-width="400">
    <v-row>
      <v-col cols="9">
        <v-text-field
          label="join/create channel"
          solo
          v-model="new_channel"
        ></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn
          class="mx-2"
          fab
          dark
          medium
          color="blue"
          v-on:click="addChannel"
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
          @input="reloadMessages"
        ></v-select>
      </v-col>
      <v-col cols="1">
        <v-btn class="mx-2" fab dark medium color="red" v-on:click="addChannel">
          <v-icon dark> mdi-chat-remove </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-card id="chat" height="400" class="scroll">
      <li v-for="(message, index) in messages" style="list-style: none">
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
          v-model="message"
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
export default {
  data: () => ({
    user: {},
    channels_name: [],
    channels: [],
    messages: [],
    message: "",
    channel: "",
    new_channel: "",
  }),

  async created() {
    await this.$axios
      .get("/users/profile")
      .then((res) => {
        this.user = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    await this.$axios
      .get("/users/channels")
      .then((res) => {
        this.channels = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    for (let i = 0; i < this.channels.length; i++)
      this.channels_name.push(this.channels[i].name);

    this.socket = this.$nuxtSocket({ name: "chat", withCredentials: true });

    this.socket.on("connect", async (msg, cb) => {
      //   console.log("Connection !");
      await this.joinChannels();
    });

    this.socket.on("NewMessage", async (msg, cb) => {
      console.log("New message received !");
      await this.reloadMessages();
      if (msg != null) {
        this.messages.push(msg);
        if (document.getElementById("chat").lastChild != null)
          document.getElementById("chat").lastChild.scrollIntoView(false);
      }
    });
  },

  methods: {
    async joinChannels() {
      for (let i = 0; i < this.channels.length; ++i) {
        let res = await this.socket.emit("JoinChan", {
          channel_id: this.channels[i].id,
          channel_name: this.channels[i].name,
        });
        console.log(res);
      }
    },

    async addChannel() {
      if (this.new_channel.length == 0) return;

      await this.$axios
        .post(
          "/channels/create",
          {
            name: this.new_channel,
            scope: "public",
          },
          {
            "Content-Type": "application/json",
          }
        )
        .then(async (res) => {
          console.log(res.data);
          await this.socket.emit("JoinChan", {
            channel_id: res.data.id,
            channel_name: res.data.name,
          });
          await this.$axios
            .get("/users/channels")
            .then((res) => {
              this.channels = res.data;
            })
            .catch((error) => {
              console.error(error);
            });

          for (let i = 0; i < this.channels.length; i++)
            this.channels_name.push(this.channels[i].name);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    async reloadMessages() {
      if (this.channel.length == 0) return;
      await this.$axios
        .get(
          "/channels/messages/" +
            (
              await this.channels.find((e) => e.name == this.channel)
            ).id
        )
        .then((res) => {
          this.messages = res.data;
          console.log(res.data);
        })
        .catch((error) => {
          console.error(error);
        });
      if (document.getElementById("chat").lastChild != null)
        document.getElementById("chat").lastChild.scrollIntoView(false);
    },

    async sendMessage() {
      /* Emit events */
      if (this.message.length == 0) return;
      if (this.channels.length == 0) return;
      if (this.channel.length == 0) return;

      let type = "message";
      if (this.message[0] == "/") type = "cmd";

      let channel_id = (await this.channels.find((e) => e.name == this.channel))
        .id;

      await this.$axios
        .post(
          "channels/handleMessage",
          {
            channel_id: channel_id,
            content: this.message,
          },
          {
            "Content-Type": "application/json",
          }
        )
        .then(async (res) => {
          await this.socket.emit("NewMessage", {
            channel_id: channel_id,
          });
          console.log("Message sent !");
        })
        .catch((error) => {
          console.error(error);
        });
      this.message = "";
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