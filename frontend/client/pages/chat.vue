<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex justify-center align-center"
  >
    <v-container fluid>
      <v-row align="center" justify="center">
        <!-- CHANNEL LIST CARD -->
        <v-card
          width="30%"
          height="80%"
          color="secondary"
          class="d-flex flex-column justify-center pb-5"
        >
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
                <v-dialog
                  v-model="addChannelDialog"
                  persistent
                  max-width="600px"
                >
                  <template v-slot:activator>
                    <!-- ADD CHANNEL BUTTON -->
                    <v-btn
                      width="190px"
                      color="primary"
                      class="mt-5"
                      @click="addChannelDialog = !addChannelDialog"
                    >
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
                            <v-form
                              ref="form"
                              v-model="valid"
                              @submit.prevent=""
                            >
                              <v-text-field
                                v-model="name"
                                :rules="rules"
                                label="Name"
                                autofocus
                              >
                              </v-text-field>
                            </v-form>
                          </v-col>
                          <v-col cols="12" class="mt-5">
                            <v-overflow-btn
                              v-model="choice"
                              filled
                              :items="channelChoice"
                              item-value="text"
                            >
                            </v-overflow-btn>
                          </v-col>
                          <v-col v-if="choice === 'protected'" cols="12">
                            <v-form @submit.prevent="">
                              <v-text-field
                                v-model="password"
                                :rules="passwordRules"
                                label="Password"
                                type="password"
                              >
                              </v-text-field>
                            </v-form>
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
                        @click="addChannelDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="success white--text"
                        :disabled="!valid"
                        depressed
                        @click="createChannel"
                      >
                        Create
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!-- END OF DIALOG CARD TO ADD CHANNEL -->

                <!-- DIALOG CARD TO JOIN CHANNEL -->
                <v-dialog
                  v-model="joinChannelDialog"
                  persistent
                  max-width="600px"
                >
                  <template v-slot:activator>
                    <!-- JOIN CHANNEL BUTTON -->
                    <v-btn
                      color="primary"
                      width="190px"
                      class="my-5"
                      @click="joinChannelDialog = !joinChannelDialog"
                    >
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
                            <v-overflow-btn
                              v-model="choice"
                              filled
                              :items="allChannels"
                              item-text="name"
                              item-value="id"
                            >
                            </v-overflow-btn>
                          </v-col>
                          <v-col cols="12">
                            <!-- je vais rajouter condition d'affichage apres -->
                            <v-form @submit.prevent="">
                              <v-text-field
                                v-model="channelPassword"
                                :rules="passwordRules"
                                label="Password"
                              >
                              </v-text-field>
                            </v-form>
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
                        @click="joinChannelDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <!-- removed :disabled="!valid" from v-btn for now-->
                      <v-btn
                        color="success white--text"
                        depressed
                        @click="joinChannel"
                      >
                        Join
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <!-- END OF DIALOG CARD TO join CHANNEL -->
              </div>

              <v-divider></v-divider>
              <!-- CHANNEL LIST -->
              <!-- basé sur des channels fakes, besoin de rajouter plus tard si channel public, owner, admin signaletique -->
              <v-list height="502px" color="secondary" mandatory>
                <div v-for="(channel, index) in channels" :key="channel.id">
                  <v-list-group @click="currentChannel = channel">
                    <template v-slot:activator>
                      <v-list-item two-line>
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-bold">
                            {{ channel.name }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider
                        v-if="index < channels.length - 1"
                        :key="index"
                      ></v-divider>
                    </template>
                    <v-list color="secondary" width="100%">
                      <div
                        v-for="(player, index) in channel.users"
                        :key="index"
                      >
                        <v-list-group
                          v-if="currentUser.id != player.id"
                          active-class="info--text"
                          sub-group
                        >
                          <template v-slot:activator>
                            <v-list-item-content>
                              <tr>
                                <td>
                                  <UserAvatarStatus
                                    :user="player"
                                    size="50px"
                                    offset="20"
                                  />
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
                            <!-- je vais devoir ajouter les conditions de display mais pour l'instant tous les btns sont visibles -->
                            <!-- aussi besoin d'ajouter pour inviter a jouer mais on verra avec en juillet je pense -->
                            <!-- PROFILE vu par tout le monde -->
                            <v-list-item dense>
                              <v-list-item-title
                                class="d-flex justify-center text-button"
                              >
                                <v-btn
                                  :to="'/profile/' + player.username"
                                  color="primary"
                                  class="mx-1"
                                  min-width="100%"
                                >
                                  PROFILE</v-btn
                                >
                              </v-list-item-title>
                            </v-list-item>
                            <!-- MUTE / KICK / BAN / BLOCK vu par tout les admins et owner -->
                            <v-list-item dense>
                              <v-list-item-title
                                class="d-flex justify-center text-button"
                              >
                                <v-btn
                                  @click=""
                                  color="accent"
                                  class="mx-1"
                                  min-width="48%"
                                >
                                  MUTE</v-btn
                                >
                                <v-btn
                                  @click=""
                                  color="accent"
                                  class="mx-1"
                                  min-width="48%"
                                  >KICK
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item dense>
                              <v-list-item-title
                                class="d-flex justify-center text-button"
                              >
                                <v-btn
                                  @click=""
                                  color="accent"
                                  min-width="100%"
                                >
                                  BAN</v-btn
                                >
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item dense>
                              <v-list-item-title
                                class="d-flex justify-center text-button"
                              >
                                <v-btn
                                  @click=""
                                  color="accent"
                                  min-width="100%"
                                >
                                  BLOCK</v-btn
                                >
                              </v-list-item-title>
                            </v-list-item>
                            <!-- ADMIN vu par tout le owner -->
                            <v-list-item dense class="mb-2">
                              <v-list-item-title
                                class="d-flex justify-center text-button"
                              >
                                <v-btn
                                  @click="
                                    () => {
                                      selectedChannel = channel;
                                      selectedUser = player;
                                      setAdmin();
                                    }
                                  "
                                  color="success"
                                  min-width="100%"
                                >
                                  ADMIN
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                          </div>
                        </v-list-group>
                        <v-divider
                          v-if="index < users.length - 1"
                          :key="index"
                        ></v-divider>
                      </div>
                    </v-list>
                  </v-list-group>
                </div>
              </v-list>
            </v-tab-item>

            <!-- DM LIST  -->
            <!-- je sais pas comment son gerer les dms donc peut pas faisable comme ca -->
            <v-tab-item>
              <v-list height="635px" color="secondary" mandatory>
                <v-list-item-group>
                  <div
                    v-for="(friend, index) in currentUser.friends"
                    :key="index"
                  >
                    <v-list-item @click="currentChannel = friend">
                      <tr>
                        <td>
                          <UserAvatarStatus
                            size="80px"
                            :user="friend"
                            :offset="20"
                          />
                        </td>
                        <td>
                          <v-list-item-title class="font-weight-bold">
                            {{ friend.username }}
                          </v-list-item-title>
                        </td>
                      </tr>
                    </v-list-item>
                    <v-divider
                      v-if="index < users.length - 1"
                      :key="index"
                    ></v-divider>
                  </div>
                </v-list-item-group>
              </v-list>
            </v-tab-item>
          </v-tabs-items>
        </v-card>

        <!-- END OF CHANNELS / DM LIST CARD -->

        <!-- CHAT CARD -->
        <!-- besoin de rajouter un bouton et dialog card params pour changer password (par exemple)-->
        <v-card
          width="60%"
          height="80%"
          color="secondary"
          class="d-flex flex-column justify-center ml-2"
        >
          <v-toolbar color="primary">
            <v-toolbar-title class="font-weight-black" style="font-size: 20px">
              {{ currentChannel.name }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!-- TO CHANGE CHANNEL PASSWORD -->
            <!-- Après seulement visible pour le owner dans les channels protégé -->
            <v-dialog
              v-model="channelSettingDialog"
              persistent
              max-width="600px"
            >
              <template v-slot:activator>
                <v-icon @click="channelSettingDialog = !channelSettingDialog"
                  >mdi-cog</v-icon
                >
              </template>

              <v-card>
                <v-card-title class="d-flex justify-center secondary">
                  <h3 class="font-weight-black info--text">CHANNEL SETTINGS</h3>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-form @submit.prevent="">
                          <v-text-field
                            v-model="changePassword"
                            :rules="passwordRules"
                            label="Change Password"
                            type="password"
                          >
                          </v-text-field>
                        </v-form>
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
                    @click="channelSettingDialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="success white--text"
                    :disabled="!valid"
                    depressed
                    @click=""
                  >
                    SAVE
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <!-- END TO CHANGE CHANNEL PASSWORD -->
          </v-toolbar>

          <!-- MESSAGES -->
          <v-list
            id="Chat"
            height="577px"
            width="100%"
            class="mt-3 d-flex flex-column"
          >
            <v-list-item-group>
              <div v-for="(msg, index) in currentChannel.messages" :key="index">
                <tr class="d-flex justify-space-between">
                  <td>
                    <v-list-item two-line disabled>
                      <v-list-item-content>
                        <v-list-item-title
                          class="font-weight-bold purple--text"
                        >
                          {{ msg.user_name }}
                        </v-list-item-title>
                        <v-list-item-content>
                          {{ msg.content }}
                        </v-list-item-content>
                      </v-list-item-content>
                    </v-list-item>
                  </td>
                  <td>
                    <!-- apres seulement visible par current user si propre msg ou admin et owner -->
                    <v-icon
                      x-small
                      class="mr-1"
                      @click="
                        () => {
                          toDelete = msg;
                          deleteMessage();
                        }
                      "
                      >mdi-close-thick</v-icon
                    >
                  </td>
                </tr>
                <v-divider
                  v-if="index < currentChannel.messages.length - 1"
                  :key="index"
                ></v-divider>
              </div>
            </v-list-item-group>
          </v-list>

          <v-spacer></v-spacer>

          <!-- TO ENTER THE MESSAGE -->
          <v-card-actions>
            <v-sheet
              color="grey"
              height="50"
              dark
              width="100%"
              class="text-center"
            >
              <v-app-bar bottom color="rgba(0,0,0,0)" flat>
                <v-text-field
                  class="mt-5"
                  v-model="input"
                  @click:append-outer="sendMessage"
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
import Vue from "vue";
import AvatarStatusVue from "~/components/User/AvatarStatus.vue";

interface Message {
  id: number;
  target_id: number;
  user_id: number;
  user_name: string;
  content: string;
}

interface Channel {
  id: number;
  name: string; // for classic channels
  username: string; // for DM channel
  users: User[];
  messages: Message[];
}

interface User {
  id: number;
  username: string;
  friends: Channel[];
}

export default Vue.extend({
  data() {
    return {
      toDelete: {} as Message,
      allChannels: [] as Channel[],
      channels: [] as Channel[],
      availableChannels: [] as Channel[],
      users: [] as User[],
      tabs: null,
      tab: ["Channels", "DM"],
      addChannelDialog: false,
      joinChannelDialog: false,
      channelSettingDialog: false,
      valid: true,
      channelChoice: [
        { text: "public" },
        { text: "private" },
        { text: "protected" },
      ],
      choice: "",
      currentChannel: {} as Channel,
      name: "",
      password: "",
      channelPassword: "",
      changePassword: "",
      input: "",
      currentUser: {} as User,
      selectedUser: {} as User,
      selectedChannel: {} as Channel,
      // besoin de bien comprendre comment les regles sont gerees / en juillet
      rules: [
        (v: string) => !!v || "Required",
        (v: string) => (v) =>
          (v && v.length <= 8) || "must be less than 8 characters",
        // (v: string) => v => !this.channels.some(channel => channel.name === v) || 'already exists',
      ],
      passwordRules: [
        (v: string) => (v) =>
          v.length <= 16 || "must be less than 16 characters",
      ],
    };
  },

  async created() {
    this.$axios
      .get("/users/profile")
      .then((res) => {
        console.log(res.data);
        this.currentUser = res.data;
        this.currentUser.friends.forEach((e) => {
          e.messages = [];
        });
      })
      .catch((error) => {
        console.error(error);
      });

    // this.$axios
    //   .get("/users")
    //   .then((res) => {
    //     console.log(res.data);
    //     this.users = res.data;
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });

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
      .then((res) => {
        this.channels = res.data;
      })
      .catch((error) => {
        console.error(error);
      });

    this.channels.forEach(async (e) => {
      await this.$axios
        .get("/channels/" + e.id + "/users")
        .then((res) => {
          e.users = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
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
      //   this.leaveChannels();
    });

    this.socket.on("JoinChan", async (channel: Channel, cb) => {
      console.log(channel.id);

      channel.messages = [];
      this.$axios
        .get("channels/" + channel.id + "/messages")
        .then((res) => {
          channel.messages = res.data;
        })
        .catch((error) => {
          console.error(error);
        });
      if (
        this.channels.find((e) => {
          return e.id == channel.id;
        }) == undefined
      )
        this.channels.push(channel);
    });

    this.socket.on("PrivateMessage", async (msg, cb) => {
      console.log(msg.user_name + ": " + msg.content);
      let id =
        this.currentUser.id == msg.target_id ? msg.user_id : msg.target_id;
      if (msg != null) {
        this.currentUser.friends
          .find((e) => {
            return e.id == id;
          })
          ?.messages.push(msg);
      }
    });

    this.socket.on("NewMessage", async (msg, cb) => {
      console.log("New message received !");
      if (msg != null) {
        this.channels
          .find((e) => {
            return e.id == msg.target_id;
          })
          ?.messages.push(msg);
      }
    });

    this.socket.on("DeleteMessage", async (msg, cb) => {
      console.log("Message deleted !");
      if (msg != null) {
        let channel = this.channels.find((e) => {
          return e.id == msg.target_id;
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
    async createChannel() {
      await this.$axios
        .post(
          "/channels/create",
          {
            name: this.name,
            scope: this.choice,
            password: this.password,
          },
          {
            "Content-Type": "application/json",
          }
        )
        .then((res) => {
          this.socket.emit("JoinChan", {
            target_id: res.data.id,
            content: this.password,
          });
          res.data.messages = [];
          this.channels.push(res.data);
        })
        .catch((error) => {
          console.error(error);
        });
      this.addChannelDialog = false;
    },

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

    async joinChannel() {
      this.socket.emit(
        "JoinChan",
        {
          target_id: this.choice,
          content: this.channelPassword,
        },
        (rep) => {
          if (rep != null) console.log("chan joined");
          else console.log("cannot join chan");
        }
      );
    },

    async setAdmin() {
      this.socket.emit("SetAdmin", {
        channel_id: this.selectedChannel.id,
        user_id: this.selectedUser.id,
      });
    },

    async deleteMessage() {
      console.log("Delete Message !");
      console.log(this.toDelete.content);
      this.socket.emit("DeleteMessage", this.toDelete);
    },

    async sendMessage() {
      console.log("sendMessage()");
      if (this.input.length == 0) return;
      if (this.channels.length == 0) return;
      if (this.currentChannel == undefined) return;

      console.log("message sent");
      let signal: String =
        this.currentChannel.username == undefined
          ? "NewMessage"
          : "PrivateMessage";

      await this.socket.emit(signal, {
        target_id: this.currentChannel.id,
        content: this.input,
      });

      this.input = "";
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

