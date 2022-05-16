<template>

    <div style="height: 80vh; max-height: 100%;" class="d-flex flex-column justify-center align-center">
        <ChatBox />
    </div>

</template>

<script lang="ts">
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
        this.socket = io(process.env.API_SOCKET_CHAT);
        this.socket.on('msgToClient', (msg) => {
            this.receiveMessage(msg);
        });
    }
})
</script>
