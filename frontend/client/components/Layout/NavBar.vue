<template>
    
    <v-app-bar app color="primary">

        <v-toolbar-title v-text="title" class="info--text"/>

        <v-spacer></v-spacer>

        <v-menu bottom min-width="200px" rounded offset-y>

            <template v-slot:activator="{ on }">
                <v-btn icon x-large v-on="on">
                    <v-avatar size="45">
                        <v-img src="/avatar.png"></v-img>
                    </v-avatar>
                </v-btn>
            </template>

            <LayoutUserCard />

        </v-menu>

    </v-app-bar>

</template>

<script lang="ts">

import  Vue from "vue"

export default {

    name: 'DefaultLayout',
    
    data () {
        return {
            title: 'The Pong Game',
            user: {
                username: 'Username',
      },
        }
    },
}
</script>