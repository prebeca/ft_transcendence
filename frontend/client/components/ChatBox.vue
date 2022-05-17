<template>
    <v-card class="pa-2" min-height="200" min-width="400">
        <v-select
          :items="this.channels_name"
          label="Channels"
          solo
        ></v-select>
        <v-card min-height="400">
            <!-- Messages -->
        </v-card>
        <br/>
        <v-row>
            <v-col cols="9">
                <v-textarea
                filled
                auto-grow
                label="Message"
                rows="2"
                row-height="15"
                ></v-textarea>
            </v-col>
            <v-col cols="1">
                <v-btn
                class="mx-2"
                fab
                dark
                medium
                color="purple"
                >
                    <v-icon dark>
                        mdi-send
                    </v-icon>
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
    }),
    async fetch() {
        console.log("fetching channels...")
        this.channels = await fetch(`${process.env.API_URL}/channels`).then((res) =>
            res.json()
        );
        
        console.log(this.channels);

        for (let i = 0; i < this.channels.length; i++)
            this.channels_name.push(this.channels[i].name);
        console.log(this.channels_name);
    },
	methods: {
	},
  }
</script>
