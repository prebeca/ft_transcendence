<template>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      fixed: false,
    }
  }
}
</script>