<template>
  <q-page>
    <div class="content-wrapper">
      <h2>{{ stationName }}</h2>
      <h3>Departures:</h3>
      <div>{{ departureData }}</div>
    </div>

    <expandable-map />
  </q-page>

  <q-inner-loading
        :showing=loading
        label="Fetching departures.."
        class="api_loading"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from "vue-router"
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import ExpandableMap from 'src/components/ExpandableMap.vue'

const $q = useQuasar()
const loading = ref(true)
const departureData = ref(null)
const stationName = ref("")

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
        console.log(response.data)
        if(response.data.Status.Code != "Ok"){
          $q.notify({
            color: 'negative',
            message: 'An API error occurred',
            caption: response.data.Status.Message,
            icon: 'report_problem'
          })
        } else {
          departureData.value = response.data.Departures
          stationName.value = response.data.Name

          // TODO display departures
        }
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
