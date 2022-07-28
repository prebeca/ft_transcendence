<template>
  <div style="height: 80vh; max-height: 100%" class="d-flex justify-center align-center">
    <v-container fluid>
      <v-row align="center" justify="center">
        <!-- CHANNEL LIST CARD -->
        <v-card width="30%" height="80%" color="secondary" class="d-flex flex-column justify-center pb-5">
          <!-- CHANNELS / DM TABS -->
          <v-toolbar color="primary" height="16px">
            <template v-slot:extension>
              <v-tabs v-model="tabs" centered color="info">
                <v-tab v-for="n in 2" :key="n" class="font-weight-bold">
                  {{ tab[n - 1] }}
                </v-tab>
              </v-tabs>
            </template>
          </v-toolbar>

          <v-tabs-items v-model="tabs">
            <v-tab-item>
              <div class="d-flex flex-column align-center">
                <v-dialog v-model="addChannelDialog" persistent max-width="600px">
                  <template v-slot:activator="{ on }">
                    <!-- ADD CHANNEL BUTTON -->
                    <v-btn width="190px" color="primary" class="mt-5" @click="addChannelDialog = !addChannelDialog"
                      v-on="on">
                      ADD CHANNEL
                    </v-btn>
                  </template>

                  <!-- DIALOG CARD TO ADD CHANNEL -->
                  <v-card>
                    <v-card-title class="d-flex justify-center secondary">
                      <h3 class="font-weight-black info--text">
                        CREATE YOUR CHANNEL
                      </h3>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-form ref="form" v-model="valid">
                              <v-text-field v-model="name" :rules="rules" label="Name">
                              </v-text-field>
                            </v-form>
                          </v-col>
                          <v-col cols="12" class="mt-5">
                            <v-overflow-btn v-model="choice" filled :items="channelChoice" item-value="text">
                            </v-overflow-btn>
                          </v-col>
                          <v-col v-if="choice === 'protected'" cols="12">
                            <v-form>
                              <v-text-field v-model="password" :rules="passwordRules" label="Password" type="password">
                              </v-text-field>
                            </v-form>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="accent" depressed dark @click="addChannelDialog = false">
                        Cancel
                      </v-btn>
                      <v-btn color="success white--text" :disabled="!valid" depressed @click="createChannel">
                        Create
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!-- END OF DIALOG CARD TO ADD CHANNEL -->

                <!-- DIALOG CARD TO JOIN CHANNEL -->
                <v-dialog v-model="joinChannelDialog" persistent max-width="600px">
                  <template v-slot:activator="{ on }">
                    <!-- JOIN CHANNEL BUTTON -->
                    <v-btn color="primary" width="190px" class="my-5" @click="
  fetchAllChannels();
joinChannelDialog = !joinChannelDialog;
                    " v-on="on">
                      JOIN CHANNEL
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title class="d-flex justify-center secondary">
                      <h3 class="font-weight-black info--text">
                        JOIN A CHANNEL
                      </h3>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col class="mt-5" cols="12">
                            <!-- besoin de rajouter où chercher channel / changer :items="channels" -->
                            <v-overflow-btn v-model="choice" filled :items="allChannels" item-text="name"
                              item-value="id">
                            </v-overflow-btn>
                          </v-col>
                          <v-col cols="12">
                            <v-form @submit.prevent="">
                              <v-text-field v-model="password" :rules="passwordRules" label="Password"
                                hint="If the channel is protected, enter password here !" persistent-hint>
                              </v-text-field>
                            </v-form>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="accent" depressed dark @click="joinChannelDialog = false">
                        Cancel
                      </v-btn>
                      <!-- removed :disabled="!valid" from v-btn for now-->
                      <v-dialog v-model="passwordDialog" persistent max-width="290">
                        <template v-slot:activator="{ on }">
                          <v-btn color="success white--text" depressed @click="joinChannel" v-on="on">
                            Join
                          </v-btn>
                        </template>
                        <v-card color="secondary">
                          <v-card-text class="text-h6 pt-5">Wrong password. Try again !</v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="passwordDialog = false">
                              OK
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!-- END OF DIALOG CARD TO join CHANNEL -->
              </div>

              <v-divider></v-divider>
              <!-- CHANNEL LIST -->
              <v-list height="502px" color="secondary" mandatory>
                <div v-for="(channel, index) in channels" :key="channel.id">
                  <v-list-group @click="
  currentChannel = channel;
messages = currentChannel.messages;
scrollToNewMsg();
                  ">
                    <template v-slot:activator>
                      <v-list-item two-line>
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-bold">
                            {{ channel.name }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider v-if="index < channels.length - 1" :key="index"></v-divider>
                    </template>
                    <v-list color="secondary" width="100%">
                      <div v-for="(player, index) in channel.users" :key="index">
                        <v-list-group v-if="user.id != player.id" active-class="info--text" sub-group>
                          <template v-slot:activator>
                            <v-list-item-content>
                              <tr>
                                <td>
                                  <UserAvatarStatus :user="player" size="50px" offset="20" />
                                </td>
                                <td>
                                  <v-list-item-title class="font-weight-bold">
                                    {{ player.username }}
                                  </v-list-item-title>
                                </td>
                              </tr>
                            </v-list-item-content>
                          </template>
                          <div>
                            <v-list-item dense>
                              <v-list-item-title class="d-flex justify-center text-button">
                                <v-btn :to="'/profile/' + player.username" color="primary" class="mx-1"
                                  min-width="100%">
                                  PROFILE</v-btn>
                              </v-list-item-title>
                            </v-list-item>
                            <div v-if="isAdmin(channel) === true">
                              <v-list-item dense>
                                <v-list-item-title class="d-flex justify-center text-button">
                                  <v-dialog v-model="muteDialog" persistent max-width="600px">
                                    <template v-slot:activator="{ on }">
                                      <v-btn @click="muteDialog = !muteDialog" color="accent" class="mx-1"
                                        min-width="48%" v-on="on">
                                        MUTE</v-btn>
                                    </template>
                                    <v-card color="secondary">
                                      <v-card-text class="text-h6 pt-5">How many minutes do you want to mute this user ?
                                      </v-card-text>
                                      <v-slider v-model="muteMinutes" thumb-label="always" thumb-size="40" max="60"
                                        min="10" class="mt-10 mx-10">
                                        <template v-slot:thumb-label>
                                          <span class="font-weight-bold" style="font-size: 15px">
                                            {{ muteMinutes }}
                                          </span>
                                        </template>
                                      </v-slider>
                                      <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="accent" @click="muteDialog = !muteDialog">
                                          CANCEL
                                        </v-btn>
                                        <v-btn color="success" @click="mute(player, channel)">
                                          OK
                                        </v-btn>
                                      </v-card-actions>
                                    </v-card>
                                  </v-dialog>
                                  <v-btn @click="kick(player, channel)" color="accent" class="mx-1" min-width="48%">
                                    KICK
                                  </v-btn>
                                </v-list-item-title>
                              </v-list-item>
                              <v-list-item dense>
                                <v-list-item-title class="d-flex justify-center text-button">
                                  <v-dialog v-model="banDialog" persistent max-width="600px">
                                    <template v-slot:activator="{ on }">
                                      <v-btn @click="banDialog = !banDialog" color="accent" min-width="100%" v-on="on">
                                        BAN</v-btn>
                                    </template>
                                    <v-card color="secondary">
                                      <v-card-text class="text-h6 pt-5">How many minutes do you want to ban this user ?
                                      </v-card-text>
                                      <v-slider v-model="banMinutes" thumb-label="always" thumb-size="40" max="60"
                                        min="10" class="mt-10 mx-10">
                                        <template v-slot:thumb-label>
                                          <span class="font-weight-bold" style="font-size: 15px">
                                            {{ banMinutes }}
                                          </span>
                                        </template>
                                      </v-slider>
                                      <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="accent" @click="banDialog = !banDialog">
                                          CANCEL
                                        </v-btn>
                                        <v-btn color="success" @click="ban(player, channel)">
                                          OK
                                        </v-btn>
                                      </v-card-actions>
                                    </v-card>
                                  </v-dialog>
                                </v-list-item-title>
                              </v-list-item>
                              <v-list-item dense>
                                <v-list-item-title class="d-flex justify-center text-button">
                                  <v-btn @click="blockUser(player.id)" color="accent" min-width="100%">
                                    BLOCK</v-btn>
                                </v-list-item-title>
                              </v-list-item>
                              <div v-if="isOwner(channel) === true">
                                <v-list-item dense class="mb-2">
                                  <v-list-item-title class="d-flex justify-center text-button">
                                    <v-btn @click="setAdmin(player, channel)" color="success" min-width="100%">
                                      ADMIN
                                    </v-btn>
                                  </v-list-item-title>
                                </v-list-item>
                              </div>
                            </div>
                          </div>
                        </v-list-group>
                        <v-divider v-if="index < users.length - 1" :key="index"></v-divider>
                      </div>
                    </v-list>
                  </v-list-group>
                </div>
              </v-list>
            </v-tab-item>

            <!-- DM LIST  -->

            <v-tab-item>
              <div class="d-flex flex-column align-center">
                <!-- DIALOG CARD TO ADD DM CHANNEL -->
                <v-dialog v-model="addDMDialog" persistent max-width="600px">
                  <template v-slot:activator>
                    <!-- ADD DM CHANNEL BUTTON -->
                    <v-btn
                      color="primary"
                      width="190px"
                      class="my-5"
                      @click="addDMDialog = true"
                    >
                      NEW DIRECT MESSAGE
                    </v-btn>
                  </template>

                  <v-card>
                    <v-card-title class="d-flex justify-center secondary">
                      <h3 class="font-weight-black info--text">
                        SELECT A USER
                      </h3>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col class="mt-5" cols="12">
                            <v-overflow-btn
                              v-model="choice"
                              filled
                              :items="user.friends"
                              item-text="username"
                              item-value="id"
                            >
                            </v-overflow-btn>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="accent"
                        depressed
                        dark
                        @click="addDMDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="success white--text"
                        depressed
                        @click="
                          createDMChannel();
                          addDMDialog = false;
                        "
                      >
                        Add
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!-- END OF DIALOG CARD TO ADD DM -->
              </div>

              <v-divider></v-divider>
              <v-list height="557px" color="secondary" mandatory>
                <v-list-group
                  v-for="(channel, index) in channels_dm"
                  :key="index"
                >
                  <template v-slot:activator>
                    <v-list-item-content
                      @click="
                        currentChannel = channel;
                        messages = currentChannel.messages;
                        scrollToNewMsg();
                      "
                    >
                      <tr>
                        <td>
                          <UserAvatarStatus
                            size="80px"
                            :user="getDMUser(channel)"
                            :offset="20"
                          />
                        </td>
                        <td>
                          <v-list-item-title class="font-weight-bold">
                            {{ getDMUserName(channel) }}
                          </v-list-item-title>
                        </td>
                      </tr>
                    </v-list-item-content>
                  </template>

                  <v-list-item dense>
                    <v-list-item-title
                      class="d-flex justify-center text-button"
                    >
                      <v-btn
                        :to="getUserProfile(channel)"
                        color="primary"
                        class="mx-1"
                        min-width="100%"
                      >
                        PROFILE
                      </v-btn>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item dense>
                    <v-list-item-title class="d-flex justify-center text-button">
                      <v-btn @click="" color="primary" min-width="100%">
                        INVITE TO GAME</v-btn>
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item dense>
                    <v-list-item-title
                      class="d-flex justify-center text-button"
                    >
                      <v-btn
                        @click="
                          () => {
                            let user = getDMUser(channel);
                            if (user == undefined) return;
                            blockUser(user.id);
                          }
                        "
                        color="accent"
                        min-width="100%"
                      >
                        BLOCK</v-btn
                      >
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider v-if="index < users.length - 1" :key="index"></v-divider>
                </v-list-group>
              </v-list>
            </v-tab-item>
          </v-tabs-items>
        </v-card>

        <!-- END OF CHANNELS / DM LIST CARD -->

        <!-- CHAT CARD -->
        <!-- besoin de rajouter un bouton et dialog card params pour changer password (par exemple)-->
        <v-card width="60%" height="80%" color="secondary" class="d-flex flex-column justify-center ml-2">
          <v-toolbar color="primary">
            <div v-if="currentChannel.scope !== 'dm'">
              <v-toolbar-title
                class="font-weight-black"
                style="font-size: 20px"
              >
                {{ currentChannel.name }}
              </v-toolbar-title>
            </div>
            <div v-else>
              <v-toolbar-title
                class="font-weight-black"
                style="font-size: 20px"
              >
                {{ getDMUserName(currentChannel) }}
              </v-toolbar-title>
            </div>

            <v-spacer></v-spacer>
            <!-- TO CHANGE CHANNEL SETTING -->
            <v-dialog v-model="channelSettingDialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-icon @click="channelSettingDialog = !channelSettingDialog" v-on="on">
                  mdi-cog</v-icon>
              </template>

              <v-card>
                <v-card-title class="d-flex justify-center secondary">
                  <h3 class="font-weight-black info--text">CHANNEL SETTINGS</h3>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col class="mt-5" cols="12" v-if="currentChannel.scope === 'protected'">
                        <v-form @submit.prevent="">
                          <v-text-field v-model="currentPassword" :rules="passwordRules" label="Current Password"
                            type="password">
                          </v-text-field>
                        </v-form>
                        <v-form @submit.prevent="">
                          <v-text-field v-model="changePassword" :rules="passwordRules" label="New Password"
                            type="password">
                          </v-text-field>
                        </v-form>
                      </v-col>
                      <v-col v-if="currentChannel.scope === 'private'" class="mt-5" cols="12">
                        <v-select :items="users" name="user" v-model="invited_user" return-object filled
                          item-text="username" label="Select" item-value="id" hint="Send an invitation to a player"
                          persistent-hint>
                        </v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="accent" depressed dark @click="channelSettingDialog = false">
                    Cancel
                  </v-btn>
                  <v-btn color="success white--text" :disabled="!valid" depressed @click="options">
                    SAVE
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- END TO CHANGE CHANNEL PASSWORD -->
          </v-toolbar>

          <!-- MESSAGES -->
          <v-list height="577px" width="100%" class="mt-3 d-flex flex-column">
            <v-list-item-group id="Chat">
              <div v-for="(msg, index) in messages" :key="index">
                <tr class="d-flex justify-space-between">
                  <td>
                    <v-list-item two-line disabled>
                      <v-list-item-content>
                        <v-list-item-title
                          class="font-weight-bold purple--text"
                        >
                          {{ msg.user.username }}
                        </v-list-item-title>
                        <v-list-item-content>
                          {{ msg.content }}
                        </v-list-item-content>
                      </v-list-item-content>
                    </v-list-item>
                  </td>
                  <td
                    v-if="
                      user.id === msg.user.id ||
                      (currentChannel.name != undefined &&
                        isAdmin(currentChannel))
                    "
                  >
                    <v-icon x-small class="mr-1" @click="deleteMessage(msg)"
                      >mdi-close-thick</v-icon
                    >
                  </td>
                </tr>
                <!-- <v-divider v-if="index < currentChannel.messages.length - 1" :key="index"></v-divider> -->
              </div>
            </v-list-item-group>
          </v-list>

          <v-spacer></v-spacer>

          <!-- TO ENTER THE MESSAGE -->
          <v-card-actions>
            <v-sheet color="grey" height="50" dark width="100%" class="text-center">
              <v-app-bar bottom color="rgba(0,0,0,0)" flat>
                <v-text-field
                  class="mt-5"
                  v-model="input"
                  @click:append-outer="sendMessage"
                  @keyup.enter="sendMessage"
                  append-outer-icon="mdi-send"
                  label="Message"
                  type="text"
                >
                </v-text-field>
              </v-app-bar>
            </v-sheet>
          </v-card-actions>
        </v-card>
        <!-- END OF CHAT CARD -->
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { NuxtSocket } from "nuxt-socket-io";
import Vue from "vue";
import AvatarStatusVue from "~/components/User/AvatarStatus.vue";

interface Message {
  id: number;
  channel: Channel;
  user: User;
  content: string;
}

interface Channel {
  id: number;
  name: string; // for classic channels
  username: string; // for DM channel
  scope: string;
  users: User[];
  owner: User;
  messages: Message[];
  admins: User[];
  banned: any[];
  muted: any[];
}

interface User {
  id: number;
  username: string;
  friends: User[];
}

export default Vue.extend({
  data() {
    return {
      invited_user: {} as User,
      messages: [] as Message[],
      allChannels: [] as Channel[],
      channels: [] as Channel[],
      channels_dm: [] as Channel[],
      users: [] as User[],
      tabs: null,
      tab: ["Channels", "DM"],
      addChannelDialog: false,
      addDMDialog: false,
      joinChannelDialog: false,
      channelSettingDialog: false,
      passwordDialog: false,
      valid: true,
      channelChoice: [
        { text: "public" },
        { text: "private" },
        { text: "protected" },
      ],
      choice: "" as string,
      choice_user: {} as User,
      currentChannel: {} as Channel,
      name: "",
      password: "",
      channelPassword: "",
      currentPassword: "",
      changePassword: "",
      input: "",
      muteDialog: false,
      muteMinutes: 10,
      banDialog: false,
      banMinutes: 10,
      // besoin de bien comprendre comment les regles sont gerees / en juillet
      rules: [
        (v: string) => !!v || "Required",
        (v: string) => (v: string) =>
          (v && v.length <= 8) || "must be less than 8 characters",
        // (v: string) => v => !this.channels.some(channel => channel.name === v) || 'already exists',
      ],
      passwordRules: [
        (v: string) => (v: string) =>
          v.length <= 16 || "must be less than 16 characters",
      ],
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
    socket: {
      type: Object,
      required: true,
    },
  },
  async created() {
    this.$axios
      .get("/users")
      .then((res) => {
        console.log(res.data);
        this.users = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    // fetch all channels
    await this.$axios
      .get("/channels")
      .then((res) => {
        this.allChannels = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    // fetch users channels
    await this.$axios
      .get("/users/channels")
      .then(async (res) => {
        this.channels = res.data;
        await this.joinChannels();
        this.channels.forEach((e) => {
          e.messages.sort((a, b) => {
            return a.id - b.id;
          });
        });
        this.channels_dm = this.channels.filter((e) => {
          return e.scope == "dm";
        });
        this.channels = this.channels.filter((e) => {
          return e.scope != "dm";
        });
        console.log(this.channels_dm);
        console.log(this.channels);
      })
      .catch((error) => {
        console.error(error);
      });

    this.socket.on("UserKick", async (msg: any) => {
      console.log("you have been kick from a channel");
      let index = this.channels.findIndex((e) => {
        return e.id == msg.channel_id;
      });
      if (index == -1) return;
      this.channels.splice(index, 1);
    });

    this.socket.on("Kick", async (msg: any) => {
      console.log("A user has been kick from a channel");
      let chan = this.channels.find((e) => {
        return e.id == msg.channel_id;
      });
      if (chan == undefined) return;
      let i = chan.users.findIndex((e) => {
        return (e.id = msg.user_id);
      }) as number;
      if (i == -1) return;
      chan.users.splice(i, 1);
      console.log(chan.users);
    });

    this.socket.on("JoinChan", async (channel: Channel) => {
      console.log("adding channel:");
      console.log(channel);
      if (
        channel.scope == "dm" &&
        this.channels_dm.find((e) => {
          return e.id == channel.id;
        }) == undefined
      ) {
        console.log("channel dm added");
        this.channels_dm.push(channel);
      }
      if (
        channel.scope != "dm" &&
        this.channels.find((e) => {
          return e.id == channel.id;
        }) == undefined
      ) {
        console.log("channel added");
        this.channels.push(channel);
      }
    });

    this.socket.on("NewMessage", async (msg: Message) => {
      console.log("New message received !");
      if (msg != null) {
        if (msg.channel.scope != "dm")
          this.channels
            .find((e) => {
              return e.id == msg.channel.id;
            })
            ?.messages.push(msg);
        else
          this.channels_dm
            .find((e) => {
              return e.id == msg.channel.id;
            })
            ?.messages.push(msg);
      }
      if (this.currentChannel.id == msg.channel.id) {
        this.scrollToNewMsg();
      }
    });

    this.socket.on("PrivateMessage", async (msg: Message) => {
      if (
        this.channels_dm.find((e) => {
          return e.id == msg.channel.id;
        }) != undefined
      )
        return;
      this.socket.emit(
        "JoinChan",
        {
          channel_id: msg.channel.id,
          password: "",
        },
        (rep: any) => {
          if (rep != null) console.log("chan joined");
          else console.log("cannot join chan");
        }
      );
    });

    this.socket.on("NewUser", async (data: any) => {
      console.log("New user in chat !");
      if (data != null) {
        let chan = this.channels.find((e) => {
          return e.id == data.channel_id;
        });
        if (
          chan &&
          chan.users.find((e) => {
            return e.id == data.user.id;
          }) == undefined
        )
          chan.users.push(data.user);
      }
    });

    this.socket.on("DeleteMessage", async (msg: Message) => {
      console.log("Message deleted !");
      if (msg != null) {
        let channel = this.channels.find((e) => {
          return e.id == msg.channel.id;
        }) as Channel;
        channel.messages.splice(
          channel.messages.findIndex((e) => {
            return e.id == msg.id;
          }),
          1
        );
      }
    });

    console.log("Created");
  },
  computed: {},
  methods: {
    blockUser(user_id: number) {
      this.$axios.post("/users/block/" + user_id);
    },

    scrollToNewMsg() {
      this.$nextTick(() => {
        document.getElementById("Chat")?.lastElementChild?.scrollIntoView();
      });
    },

    async fetchAllChannels() {
      await this.$axios
        .get("/channels")
        .then((res) => {
          this.allChannels = res.data;
          this.allChannels = this.allChannels.filter((e) => {
            return e.scope != "dm";
          });
        })
        .catch((error) => {
          console.error(error);
        });
    },

    async createChannel() {
      console.log("this.createChannel");
      await this.$axios
        .post("/channels/create", {
          name: this.name,
          scope: this.choice,
          password: this.password,
        })
        .then((res) => {
          console.log("this.createChannel.then");
          if (typeof res.data === "string") {
            this.socket.emit("Alert", {
              color: "red",
              content: "ERROR : " + res.data,
            });
            return;
          }
          this.socket.emit("JoinChan", {
            target_id: res.data.id,
            content: this.password,
          });
        })
        .catch((error) => {
          console.error(error);
          this.socket.emit("Alert", {
            color: "red",
            content: "ERROR : " + error.message,
          });
        });
      this.password = "";
      this.addChannelDialog = false;
    },

    async joinChannels() {
      for (let i = 0; i < this.channels.length; ++i) {
        await this.socket.emit(
          "JoinChan",
          {
            channel_id: this.channels[i].id,
            password: "",
          },
          (rep: any) => {
            if (rep != null) console.log("chan joined");
            else console.log("cannot join chan");
          }
        );
      }
    },

    async joinChannel() {
      this.socket.emit(
        "JoinChan",
        {
          channel_id: this.choice,
          password: this.password,
        },
        (rep: any) => {
          if (rep != null) console.log("chan joined");
          else {
            console.log("cannot join chan");
            this.passwordDialog = true;
          }
        }
      );
      this.password = "";
      this.joinChannelDialog = false;
    },

    async createDMChannel() {
      await this.socket.emit("NewDMChannel", {
        id: this.choice,
      });
    },

    async kick(user: User, channel: Channel) {
      this.socket.emit("Kick", {
        user_id: user.id,
        channel_id: channel.id,
      });
    },

    async ban(user: User, channel: Channel) {
      this.socket.emit("Ban", {
        user_id: user.id,
        channel_id: channel.id,
        duration: 1, // placeholder
      });
    },

    async mute(user: User, channel: Channel) {
      this.socket.emit("Mute", {
        user_id: user.id,
        channel_id: channel.id,
        duration: 1, // placeholder
      });
    },

    async setAdmin(user: User, channel: Channel) {
      this.socket.emit("SetAdmin", {
        channel_id: channel.id,
        user_id: user.id,
      });
      //   this.joinChannelDialog = false;
    },

    async deleteMessage(msg: Message) {
      console.log("Delete Message !");
      console.log(msg.content);
      this.socket.emit("DeleteMessage", msg);
    },

    async sendMessage() {
      if (this.input.length == 0) return;
      if (this.channels.length == 0) return;
      if (this.currentChannel == undefined) return;

      await this.socket.emit("NewMessage", {
        channel: this.currentChannel,
        content: this.input,
      });

      this.input = "";
    },

    async isPublic(channel: Channel) {
      if (channel.scope === "public") return;
      return false;
    },

    isAdmin(channel: Channel) {
      for (let i = 0; i < channel.admins.length; ++i) {
        if (this.user.id === channel.admins[i].id) return true;
      }
      return false;
    },

    isOwner(channel: Channel) {
      if (this.user.id === channel.owner.id) return true;
      return false;
    },

    async isProtectedChannel(choice: string) {
      console.log("check protected");
      for (let i = 0; i < this.allChannels.length; i++) {
        if (parseInt(choice) === this.allChannels[i].id) {
          if (this.allChannels[i].scope === "protected") return true;
        }
      }
      return false;
    },

    getDMUser(channel: Channel): User | undefined {
      //   console.log(channel.users.length);
      return channel.users.find((e) => {
        return e.id != this.user.id;
      });
    },

    getUserProfile(channel: Channel): string {
      let user = this.getDMUser(channel);
      if (user == undefined) return "error";
      return "/profile/" + this.getDMUser(channel)?.username;
    },

    getDMUserName(channel: Channel): string {
      let name = channel.users.find((e) => {
        return e.id != this.user.id;
      })?.username;
      if (name == undefined) name = "unknown";
      return name;
    },

    async options(choice: string) {
      if (this.currentChannel == undefined) return;
      if (this.currentChannel.scope == "private") {
        this.socket.emit("Invite", {
          target_id: this.invited_user.id,
          channel_id: this.currentChannel.id,
        });
      } else if (this.currentChannel.scope == "protected") {
        await this.$axios
          .post("/channels/" + this.currentChannel.id + "/update/password", {
            channel_id: this.currentChannel.id,
            password_old: this.currentPassword,
            password_new: this.changePassword,
          })
          .then((res) => {
            this.socket.emit("Alert", res.data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
  components: {},
});
</script>

<style scoped>
.v-list {
  overflow-y: auto;
}

.v-window {
  background-color: rgb(81, 45, 168) !important;
}
</style>