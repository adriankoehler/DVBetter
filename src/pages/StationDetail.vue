<template>
  <q-page>
    <div class="content-wrapper no-x-padding">
      <div class="row">
          <h2 class="q-pl-std">{{ stationName }}</h2>
          <!-- bookmark und bookmark_border switchen -->
          <q-icon id="bookmark-station-icon" class="self-center cursor-pointer q-ml-auto q-pr-std" :name="icon" size="sm" @click="bookmark()"/>
      </div>
      <departure-entry v-for="departureEntry in departureData" :departure="departureEntry" :key="departureEntry.Id" />
    </div>

    <expandable-map :station="stationName"/>
  </q-page>

  <q-inner-loading
        :showing=loading
        label="Fetching departures.."
        class="api_loading"
  />
</template>

<style lang="scss">
.no-x-padding {
  // overwrite padding of '.content-wrapper'
  padding-left: 0;
  padding-right: 0;
}
</style>

<script setup>
import { ref } from 'vue'
import { useRoute } from "vue-router"
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { settingsFunctions } from 'stores/helperFunctions.js'
import DepartureEntry from 'components/DepartureEntry.vue'
import ExpandableMap from 'components/ExpandableMap.vue'

import { Preferences } from '@capacitor/preferences';

const $q = useQuasar()
const loading = ref(true)
const departureData = ref(null)
const stationName = ref("")
const icon = ref("bookmark_border")

// offline testing
// departureData.value = [ { "Id": "voe:11008: :H:j24", "DlId": "de:vvo:11-8", "LineName": "8", "Direction": "Südvorstadt", "Platform": { "Name": "4", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804220000-0000)/", "ScheduledTime": "/Date(1703804280000-0000)/", "State": "InTime", "RouteChanges": [ "19653" ], "Diva": { "Number": "11008", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:21066: :R:j24", "DlId": "de:vvo:21-66", "LineName": "66", "Direction": "Nickern", "Platform": { "Name": "5", "Type": "Platform" }, "Mot": "CityBus", "RealTime": "/Date(1703804280000-0000)/", "ScheduledTime": "/Date(1703804280000-0000)/", "State": "InTime", "RouteChanges": [ "19653", "19471" ], "Diva": { "Number": "21066", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:11010: :H:j24", "DlId": "de:vvo:11-10", "LineName": "10", "Direction": "Gorbitz", "Platform": { "Name": "2", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804340000-0000)/", "ScheduledTime": "/Date(1703804220000-0000)/", "State": "Delayed", "RouteChanges": [ "19446", "19653" ], "Diva": { "Number": "11010", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "ddb:92D01: :R:j24", "DlId": "de:vvo:10-1", "LineName": "S1", "Direction": "Meißen S-Bf. Triebischtal", "Platform": { "Name": "14", "Type": "Railtrack" }, "Mot": "SuburbanRailway", "RealTime": "/Date(1703804400000-0000)/", "ScheduledTime": "/Date(1703804400000-0000)/", "State": "InTime", "RouteChanges": [ "19695", "19688" ], "Diva": { "Number": "92D01", "Network": "ddb" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:11003: :H:j24", "DlId": "de:vvo:11-3", "LineName": "3", "Direction": "Wilder Mann", "Platform": { "Name": "3", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804700000-0000)/", "ScheduledTime": "/Date(1703804700000-0000)/", "State": "InTime", "RouteChanges": [ "19653" ], "Diva": { "Number": "11003", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" } ]
// stationName.value = "Wörgl"
// loading.value = false

const route = useRoute()
const stationId = route.params.stationId //f.e.: Hbf=33000028

if (stationId) {
  settingsFunctions.isBookmarked(stationId).then(response => {
    icon.value = response ? "bookmark" : "bookmark_border"
  })

  api.post('/dm', {
          stopid: stationId,
          limit: 10,
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

async function bookmark() {
  const isBookmarked = await settingsFunctions.bookmark(stationId)
  icon.value = isBookmarked ? "bookmark" : "bookmark_border"
}
</script>
