<template>
    <div style="height: 80vh; max-height: 100%" class="d-flex justify-center align-center">


        <v-container fluid>
            <v-row align="start" justify="center">
                <!-- CHANNEL LIST CARD -->
                <v-card min-width="20%" height="80%" color="secondary" class="d-flex flex-column justify-center pb-5">

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

                    <!-- ADD CHANNEL BUTTON -->
                    <v-tabs-items v-model="tabs">
                        <v-tab-item>
                            <v-dialog v-model="channelDialog" persistent max-width="600px">
                                <template v-slot:activator>
                                    <v-btn class="mt-5 mx-8" color="primary" @click="channelDialog = !channelDialog">
                                        <v-icon>mdi-plus</v-icon>ADD CHANNEL
                                    </v-btn>
                                </template>

                                <!-- DIALOG CARD TO ADD CHANNEL -->
                                <v-card>
                                    <v-card-title class=" d-flex justify-center secondary">
                                        <h3 class="font-weight-black info--text">CREATE YOUR CHANNEL</h3>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-form ref="form" v-model="valid" @submit.prevent="">
                                                        <v-text-field v-model="name" :rules="rules" label="Name"
                                                            autofocus>
                                                        </v-text-field>
                                                    </v-form>
                                                </v-col>
                                                <v-col cols="12">
                                                    <v-form @submit.prevent="">
                                                        <v-text-field v-model="password" :rules="passwordRules"
                                                            label="Password *" type="password">
                                                        </v-text-field>
                                                    </v-form>
                                                </v-col>
                                            </v-row>
                                            <small>* not mandatory</small>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="accent" depressed dark @click="channelDialog = false"> Cancel
                                        </v-btn>
                                        <v-btn color="success white--text" :disabled="!valid" depressed @click="">
                                            SAVE </v-btn>
                                    </v-card-actions>
                                </v-card>
                                <!-- END OF DIALOG CARD TO ADD CHANNEL -->
                            </v-dialog>

                            <!-- SEARCH BAR / DOESN'T WORK NOW -->
                            <v-text-field v-model="searchChannel" class="d-flex justify-center mx-5" label="search">
                            </v-text-field>
                            <v-divider class="mt-1"></v-divider>

                            <!-- CHANNEL LIST -->
                            <!-- basé sur des channels fakes, besoin de rajouter plus tard si channel public, owner, admin signaletique -->
                            <v-list v-if="searchChannel == ''" height="504px" color="secondary" mandatory>
                                <v-list-item-group>
                                    <div v-for="(channel, index) in channels" :key="channel.id">
                                        <v-list-item two-line @click="currentChanel = channel">
                                            <v-list-item-content>
                                                <v-list-item-title class="font-weight-bold"> {{ channel.name }}
                                                </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider v-if="index < channels.length - 1" :key="index"></v-divider>
                                    </div>
                                </v-list-item-group>
                            </v-list>
                        </v-tab-item>

                        <!-- DM LIST  -->
                        <!-- je sais pas comment son gerer les dms donc peut pas faisable comme ca -->
                        <v-tab-item>
                            <v-list height="635px" color="secondary" mandatory>
                                <v-list-item-group>
                                    <div v-for="(friend, index) in currentUser.friends" :key="index">
                                        <v-list-item @click="">
                                            <tr>
                                                <td>
                                                    <UserAvatarStatus size="80px" :user="friend" :offset="20" />
                                                </td>
                                                <td>
                                                    <v-list-item-title class="font-weight-bold"> {{ friend.username }}
                                                    </v-list-item-title>
                                                </td>

                                            </tr>
                                        </v-list-item>
                                        <v-divider v-if="index < users.length - 1" :key="index"></v-divider>
                                    </div>
                                </v-list-item-group>
                            </v-list>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>

                <!-- END OF CHANNELS LIST CARD -->

                <!-- CHAT CARD -->
                <!-- besoin de rajouter un bouton et dialog card params pour changer password (par exemple)-->
                <v-card width="40%" height="80%" color="secondary" class="d-flex flex-column justify-center ml-2">
                    <v-toolbar color="primary" class="d-flex justify-center">
                        <v-toolbar-title class="font-weight-black info--text" style="font-size: 20px">
                            {{ currentChanel.name }}
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-list id="Chat" height="577px" class="mt-3 d-flex flex-column">

                        <v-list-item-group>
                            <div v-for="(msg, index) in currentChanel.message" :key="index">
                                <v-list-item two-line disabled>
                                    <v-list-item-content>
                                        <v-list-item-title class="font-weight-bold purple--text"> {{
                                                msg.sender.username
                                        }}
                                        </v-list-item-title>
                                        <v-list-item-content> {{ msg.msg }} </v-list-item-content>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-divider v-if="index < currentChanel.message.length - 1" :key="index"></v-divider>
                            </div>
                        </v-list-item-group>
                    </v-list>

                    <v-spacer></v-spacer>

                    <!-- TO ENTER THE MESSAGE -->
                    <v-card-actions>
                        <v-sheet color="grey" height="50" dark width="100%" class="text-center">
                            <v-app-bar bottom color="rgba(0,0,0,0)" flat>
                                <v-text-field class="mt-5" v-model="input" append-outer-icon="mdi-send" label="Message"
                                    type="text">
                                </v-text-field>
                            </v-app-bar>
                        </v-sheet>
                    </v-card-actions>
                </v-card>
                <!-- END OF CHAT CARD -->

                <!-- USERS CARD -->
                <v-card width="20%" height="80%" color="secondary" class="d-flex flex-column justify-center ml-2">
                    <v-toolbar color="primary" class="d-flex justify-center">
                        <v-toolbar-title class="font-weight-black info--text" style="font-size: 20px">
                            PLAYERS
                        </v-toolbar-title>
                    </v-toolbar>

                    <!-- List des players dans le channel mais pour le moment utilise tous les users -->
                    <v-list height="655px" color="secondary">
                        <div v-for="(player, index) in users" :key="index">
                            <v-list-group v-if="currentUser.id != player.id" active-class="info--text">
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
                                    <!-- je vais devoir ajouter les conditions de display mais pour l'instant tous les btns sont visibles -->
                                    <!-- aussi besoin d'ajouter pour inviter a jouer mais on verra avec en juillet je pense -->
                                    <v-list-item dense>
                                        <v-list-item-title class="d-flex justify-center text-button">
                                            <v-btn @click="" color="accent" class="mx-1" min-width="48%">
                                                MUTE</v-btn>
                                            <v-btn @click="" color="accent" class="mx-1" min-width="48%">KICK
                                            </v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item dense>
                                        <v-list-item-title class="d-flex justify-center text-button">
                                            <v-btn @click="" color="accent" min-width="100%">
                                                BAN</v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                    <v-list-item dense class="mb-2">
                                        <v-list-item-title class="d-flex justify-center text-button">
                                            <v-btn @click="" color="success" min-width="100%">
                                                ADMIN
                                            </v-btn>
                                        </v-list-item-title>
                                    </v-list-item>
                                </div>
                            </v-list-group>
                            <v-divider v-if="index < users.length - 1" :key="index"></v-divider>
                        </div>
                    </v-list>
                </v-card>
                <!-- END OF USERS CARD -->
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import AvatarStatusVue from "~/components/User/AvatarStatus.vue";

export default Vue.extend({
    data() {
        return {
            tabs: null,
            tab: ["Channels", "DM"],
            channelDialog: false,
            passwordDialog: false,
            playerDialog: false,
            showInput: false,
            valid: true,
            currentChanel: {
                name: "",
                id: "",
                public: true,
                owner: {
                    id: "",
                },
                message: [
                    {
                        sender: {
                            id: "",
                            username: ""
                        },
                        msg: "",
                    },
                ],
            },
            name: "",
            password: "",
            searchChannel: "",
            awaitingSearch: false,
            input: "",
            invitDialog: false,
            currentUser: {
                id: "",
                username: "",
                friends: [
                    {
                        username: "",
                    }
                ]
            },
            users: [
                {
                    id: "",
                    username: "",
                }
            ],
            // besoin de bien comprendre comment les regles sont gerees / en juillet
            rules: [
                (v: string) => !!v || "Required",
                (v: string) => v => (v && v.length <= 8) || "must be less than 8 characters",
                // (v: string) => v => !this.channels.some(channel => channel.name === v) || 'already exists',
            ],
            passwordRules: [
                (v: string) => v => v.length <= 16 || "must be less than 16 characters",
            ],
            // pour tests, a supprimer quand on aura les channels deouis le back
            channels: [
                {
                    name: "test0",
                    id: "0",
                    public: true,
                    owner: {
                        id: "1",
                    },
                    adminsID: ["1", "2", "3"],
                    message: [
                        {
                            sender: {
                                id: "2",
                                username: "Pierre"
                            },
                            msg: "hello ca va ?"
                        },
                        {
                            sender: {
                                id: "3",
                                username: "Paul"
                            },
                            msg: "ca va et toi ?"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb khjqsdbhgjlfvbnvdhsqbgvbhqsdbvjhbqshbvdjhdqzfgvuidhqgvjkndsqjklvjkldfhqshqgvyhqgb"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Jacques"
                            },
                            msg: "jbnjnj jjksdfbjhsd bhsdfjksdb                          ilkjihnkj                             jkkkkkkkkkkkkkkkkkkkkkkb                 jlmmmmmmmmmmmmmmmmmmmmmmmmmb                      ikkkkkkkkkkkkkkkkkkkkk                 klhnnnnnnnnnnnnnnnnnnnnn"
                        },
                    ]
                },
                {
                    name: "test1",
                    id: "1",
                    public: true,
                    owner: {
                        id: "1",
                    },
                    adminsID: ["1", "2", "3"],
                    message: [
                        {
                            sender: {
                                id: "2",
                                username: "Amelie"
                            },
                            msg: "bsdgvsb?"
                        },
                        {
                            sender: {
                                id: "3",
                                username: "Machin"
                            },
                            msg: "dfsbsd?"
                        },
                        {
                            sender: {
                                id: "2",
                                username: "Ada"
                            },
                            msg: "bdfbsdbbsd"
                        },
                    ],
                },
                {
                    name: "test2",
                    id: "2",
                    public: true,
                    owner: {
                        id: "1",
                    },
                    adminsID: ["1", "2", "3"],
                },
                {
                    name: "test3",
                    id: "3",
                    public: true,
                    owner: {
                        id: "1",
                    },
                    adminsID: ["1", "2", "3"],
                },
            ],
        };
    },
    created: function () {
        this.$axios
            .get("/users/profile")
            .then((res) => {
                console.log(res.data);
                this.currentUser = res.data;
            })
            .catch((error) => {
                console.error(error);
            });
        this.$axios
            .get("/users")
            .then((res) => {
                console.log(res.data);
                this.users = res.data;
            })
            .catch((error) => {
                console.error(error);
            });
    },
    computed: {},
    methods: {},
    components: {}
})
</script>

<style scoped>
.v-list {
    overflow-y: auto
}

.v-window {
    background-color: rgb(81, 45, 168) !important;
}
</style>

