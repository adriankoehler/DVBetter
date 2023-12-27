<template>
  <q-page>
    <h1>Station {{ stationId }}</h1>
    <h2>Departures:</h2>
    <!-- TODO loading -->
    <div>{{ data }}</div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from "vue-router"
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const data = ref(null)

const route = useRoute()
const stationId = route.params.stationId //f.e.: Hbf=33000028

if (stationId) {
  api.post('/dm', {
          stopid: stationId,
          limit: 5,
          mot: [
            "Tram",
            "CityBus",
            "IntercityBus",
            "SuburbanRailway",
            "Train"
          ]
        })
      .then((response) => {
        data.value = response.data
      })
      .catch(() => {
        $q.notify({
          color: 'negative',
          position: 'top',
          message: 'An error occurred fetching data from the VVO API',
          icon: 'report_problem'
        })
      })
}
</script>
