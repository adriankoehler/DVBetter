<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
  </q-page>
</template>

<script setup>
import { useRouter } from "vue-router"

//TODO could be a user setting
useRouter().push({ path: '/stations' })
</script>
