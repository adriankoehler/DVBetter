<template>
  <div class="search-field self-end">
    <search-field ref="station1" :type="type"/>
    <search-field ref="station2" v-if="type==='connections'" :type="type"/>

    <q-btn v-if="type==='departures'" @click="findDepartures" color="primary" label="Find departures" no-caps/>
    <q-btn v-else @click="findConnections" color="primary" label="Find connections" no-caps/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"
import { useQuasar } from 'quasar'
import SearchField from 'components/SearchField.vue'

const $q = useQuasar()
const router = useRouter()
const props = defineProps(['type'])

const station1 = ref(null)
const station2 = ref(null)

function findDepartures() {
  const searchText1 = station1.value.searchText ?? false
  if (!searchText1) {
    $q.notify({
      color: 'negative',
      message: 'An error occurred searching for departures',
      caption: 'Station invalid',
      icon: 'report_problem'
    })
    return
  }
  router.push(`/stations/${searchText1.id}`)
}

function findConnections() {
  const searchText1 = station1.value.searchText ?? false
  const searchText2 = station2.value.searchText ?? false
  if (!searchText1 || !searchText2) {
    $q.notify({
      color: 'negative',
      message: 'An error occurred searching for connections',
      caption: 'Stations invalid',
      icon: 'report_problem'
    })
    return
  }
  router.push(`/connections/${searchText1.id}-${searchText2.id}`)
}
</script>

<style lang="scss">
.search-field {
  padding: $main-content-padding;
  width: 100%;

  background-color: $dark;

  & > *:not(:last-child) {
    margin-bottom: 1.5em;
  }

  button {
    width: 100%;
  }
}
</style>
