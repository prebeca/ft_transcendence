<template>
  <v-card class="pa-2" min-height="200" min-width="400">
    <v-select
      :items="this.channels_name"
      label="Channels"
      v-model="channel"
      solo
    ></v-select>
    <v-card min-height="400">
      <li v-for="({ content }, index) in messages">
        {{ content }}
      </li>
    </v-card>
    <br />
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
    channels_name: [],
    channels: [],
    messages: [],
    message: "",
    channel: "",
  }),

  async fetch() {
    await fetch(`${process.env.API_URL}/channels/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "General",
        scope: "public",
      }),
    });

    console.log("fetching channels...");
    this.channels = await fetch(`${process.env.API_URL}/channels`).then((res) =>
      res.json()
    );

    for (let i = 0; i < this.channels.length; i++)
      this.channels_name.push(this.channels[i].name);
  },

  mounted() {
    this.socket = this.$nuxtSocket({ name: "chat" });

    this.socket.on("connect", (msg, cb) => {
      console.log("Connection !");
    });

    this.socket.on("NewMessage", (msg, cb) => {
      console.log("New message received !");
      this.messages.push(msg);
    });
  },
  methods: {
    sendMessage() {
      /* Emit events */
      if (this.message.length == 0) return;
      if (this.channels.length == 0) return;
      if (this.channel.length == 0) return;

      this.socket.emit(
        "JoinChan",
        {
          sender_id: 1,
          channel_id: this.channels.find((e) => e.name === this.channel).id,
          channel_name: this.channel,
        },
        (resp) => {}
      );
      this.socket.emit(
        "MessageSend",
        {
          sender_id: 1,
          channel: this.channel,
          channel_id: this.channels.find((e) => e.name === this.channel).id,
          content: this.message,
        },
        (resp) => {}
      );
      this.message = "";
      console.log("Message sent !");
    },
  },
};
</script>
