<template>
  <q-page>
    <h1>Connection from {{ stationIdOrigin }} to {{ stationIdDestination }}</h1>
    <h2>Connections:</h2>
    <div>{{ data }}</div>
  </q-page>

  <q-inner-loading
        :showing=loading
        label="Fetching connections.."
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
const connectionId = route.params.connectionId //f.e.: Hbf to Theaterplatz = "33000028-33000020"
const stationIdOrigin = connectionId.substring(0, connectionId.indexOf("-")) //f.e.: Hbf=33000028
const stationIdDestination = connectionId.substring(connectionId.indexOf("-") + 1)

if (connectionId) {
  api.post('/tr/trips?format=json', {
            destination: stationIdDestination,
            isarrivaltime: false,
            mobilitySettings: {
                mobilityRestriction: "None"
            },
            origin: stationIdOrigin,
            shorttermchanges: true,
            standardSettings: {
                footpathToStop: 5,
                includeAlternativeStops: true,
                maxChanges: "Unlimited",
                mot: [
                    "Tram",
                    "CityBus",
                    "IntercityBus",
                    "SuburbanRailway",
                    "Train"
                ],
                walkingSpeed: "Normal"
            },
            // time: "2023-12-08T21:36:42.775Z"
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
