<template>
  <div
    style="height: 80vh; max-height: 100%"
    class="d-flex flex-column justify-center align-center"
  >
    <li v-for="room in rooms" :key="room.name">
      {{ room.name }}
      <v-btn color="success" class="mr-2" @click="join(room.name)">
        join
      </v-btn>
    </li>
  </div>
</template>

<style scoped>
li {
  margin-top: 10px;
}
</style>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      rooms: [
        {
          name: "",
        },
      ],
    };
  },
  created: async function () {
    await this.$axios
      .get("/gameroom/list")
      .then((res) => {
        var array: string[];
        array = res.data;
        for (let i = 0; i < array.length; i++) {
          if (i === 0 && this.rooms[0].name === "") {
            this.rooms[0].name = array[i] as string;
          } else {
            this.rooms.push({ name: array[i] });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
  methods: {
    async join(name: string) {
      if (name === "") return;
      this.$router.push({ path: "/groom/room", query: { name: name } });
      console.log("does nothing" + name);
    },
  },
});
</script>
