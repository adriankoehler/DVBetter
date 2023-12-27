<template>
  <q-page>
    <h1>Station {{ stationId }}</h1>
    <h2>Departures:</h2>
    <div>{{ data }}</div>
  </q-page>

  <q-inner-loading
        :showing=loading
        label="Fetching departures.."
        label-style="font-size: 1.1em"
        class="api_loading"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from "vue-router"
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const data = ref(null)
const loading = ref(true)

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
        loading.value = false
      })
      .catch(() => {
        loading.value = false
        $q.notify({
          color: 'negative',
          message: 'An error occurred fetching data from the VVO API',
          icon: 'report_problem'
        })
      })
}
</script>
