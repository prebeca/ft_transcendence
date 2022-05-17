<template>

    <div style="height: 80vh; max-height: 100%;" class="d-flex flex-column justify-center align-center">
        <h1>{{ title }}</h1>
        <form>
            <input v-model="text" type="text"/>
            <button type="submit" @click.prevent="sendMessage()">Send</button>
            </form>
            <p>
                <ul>
                    <li :key='msg' v-for="msg of messages">{{ msg }}</li>
                </ul>
            </p>
    </div>

</template>

<script lang="ts">
/*
import Vue from 'vue'
import socket from 'socket.io'
import io from 'socket.io-client'

export default Vue.extend({
    data() {
        return {
            title: 'Websockets Tester',
            text: '',
            messages: ['Some message', 'Another message'],
            socket: null,
        }
    },
    methods: {
        sendMessage() {
            // this.messages.push(this.text);
            console.log(`send: ${this.text}`);
            this.socket.emit('msgToServer', this.text);
            this.text = '';
        },
        receiveMessage(msg) {
            console.log(`recv: ${msg}`);
            this.messages.push(msg);
            // this.text = '';
        },
    },
    created() {
        this.socket = io(process.env.API_SOCKET_GAME);
        this.socket.on('msgToClient', (msg) => {
            this.receiveMessage(msg);
        });
    }
})*/
</script>
