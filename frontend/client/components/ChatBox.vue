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
    console.log("fetching channels...");
    this.channels = await fetch(`${process.env.API_URL}/channels`).then((res) =>
      res.json()
    );

    console.log(this.channels);

    for (let i = 0; i < this.channels.length; i++)
      this.channels_name.push(this.channels[i].name);
    console.log(this.channels_name);
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      name: "chat",
    });
    /* Listen for events: */
    this.socket.on("connection", (msg, cb) => {
      console.log("Connection !");
    });
    this.socket.on("NewMessage", (msg, cb) => {
      console.log("New message received !");
      console.log(msg);
      this.messages.push(msg);
    });
  },
  methods: {
    sendMessage() {
      /* Emit events */
      console.log("Sending message !");
      console.log(this.message);
      this.socket.emit(
        "MessageSend",
        {
          sender_id: 1,
          channel: this.channel,
          content: this.message,
        },
        (resp) => {}
      );
      this.$refs.textArea.clear;
    },
  },
};
</script>
