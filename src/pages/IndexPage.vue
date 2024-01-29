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
import { useRouter } from 'vue-router'
import { Preferences } from '@capacitor/preferences'

const router = useRouter()

Preferences.get({ key: 'startScreen' }).then(response => {
  router.push({path: '/'+response.value});
})
.catch(() => {
  console.log("no startpage set; using default..")
  useRouter().push({ path: '/stations' })
})
</script>
