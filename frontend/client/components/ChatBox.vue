<template>
  <v-card class="pa-2" min-height="200" min-width="400">
    <v-select
      :items="channels_name"
      label="Channels"
      v-model="channel"
      solo
      @input="reloadMessages"
    ></v-select>
    <v-card id="chat" height="400" class="scroll">
      <li v-for="(message, index) in messages" style="list-style: none">
        <p v-if="message.type == 'info'">
          {{ message.content }}
        </p>
        <p v-if="message.type == 'message'">
          {{ message.username }}: {{ message.content }}
        </p>
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
      .post(
        "/channels/create",
        {
          name: "General",
          scope: "public",
        },
        {
          "Content-Type": "application/json",
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });

    await this.$axios
      .post(
        "/channels/create",
        {
          name: "MyProtectedChannel",
          scope: "protected",
          password: "password",
        },
        {
          "Content-Type": "application/json",
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error(error);
      });

    await this.$axios
      .post(
        "/channels/create",
        {
          name: "MyPrivateChannel",
          scope: "private",
        },
        {
          "Content-Type": "application/json",
        }
      )
      .then((res) => {
        console.log(res.data);
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

    this.socket = this.$nuxtSocket({ name: "chat" });

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

      await this.socket.emit("MessageSend", {
        type: type,
        user_id: this.user.id,
        username: this.user.username,
        channel_id: (
          await this.channels.find((e) => e.name == this.channel)
        ).id,
        channel_name: this.channel,
        content: this.message,
      });
      this.message = "";
      console.log("Message sent !");
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