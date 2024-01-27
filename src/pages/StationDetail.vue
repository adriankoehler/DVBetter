<template>
  <q-page>
    <div class="content-wrapper no-x-padding">
      <q-pull-to-refresh @refresh="refresh">
        <div class="row">
          <h2 class="q-pl-std">
            <span v-if="stationAbbreviation" class="text-weight-bold">{{ stationAbbreviation }} | </span>
            <span class="text-weight-regular"> {{ stationName }} </span>
          </h2>
          <q-icon id="bookmark-station-icon" class="self-center cursor-pointer q-ml-auto q-pr-std" :name="icon" size="sm" @click="bookmark()"/>
        </div>
        <q-separator />
        <departure-entry
          v-for="departureEntry in departureData"
          :departure="departureEntry"
          :key="departureEntry.Id + forceRefreshId"
        />
      </q-pull-to-refresh>
    </div>

    <expandable-map :station="stationId"/>
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
import { Preferences } from "@capacitor/preferences";
import { dateFunctions, settingsFunctions } from 'stores/helperFunctions.js'
import DepartureEntry from 'components/DepartureEntry.vue'
import ExpandableMap from 'components/ExpandableMap.vue'
import stationsJson from "assets/stations_dresden.json";

const $q = useQuasar()
const loading = ref(true)
const departureData = ref(null)
const stationName = ref("")
const stationAbbreviation = ref("")
const route = useRoute()
const stationId = ref(route.params.stationId) //f.e.: Hbf=33000028

const icon = ref("bookmark_border")
let forceRefreshId = 0; //increased in refresh(); lets the component know that it should be reloaded (to update/recalculate the relative departure times)

// offline testing
// departureData.value = [ { "Id": "voe:11008: :H:j24", "DlId": "de:vvo:11-8", "LineName": "8", "Direction": "Südvorstadt", "Platform": { "Name": "4", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804220000-0000)/", "ScheduledTime": "/Date(1703804280000-0000)/", "State": "InTime", "RouteChanges": [ "19653" ], "Diva": { "Number": "11008", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:21066: :R:j24", "DlId": "de:vvo:21-66", "LineName": "66", "Direction": "Nickern", "Platform": { "Name": "5", "Type": "Platform" }, "Mot": "CityBus", "RealTime": "/Date(1703804280000-0000)/", "ScheduledTime": "/Date(1703804280000-0000)/", "State": "InTime", "RouteChanges": [ "19653", "19471" ], "Diva": { "Number": "21066", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:11010: :H:j24", "DlId": "de:vvo:11-10", "LineName": "10", "Direction": "Gorbitz", "Platform": { "Name": "2", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804340000-0000)/", "ScheduledTime": "/Date(1703804220000-0000)/", "State": "Delayed", "RouteChanges": [ "19446", "19653" ], "Diva": { "Number": "11010", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "ddb:92D01: :R:j24", "DlId": "de:vvo:10-1", "LineName": "S1", "Direction": "Meißen S-Bf. Triebischtal", "Platform": { "Name": "14", "Type": "Railtrack" }, "Mot": "SuburbanRailway", "RealTime": "/Date(1703804400000-0000)/", "ScheduledTime": "/Date(1703804400000-0000)/", "State": "InTime", "RouteChanges": [ "19695", "19688" ], "Diva": { "Number": "92D01", "Network": "ddb" }, "CancelReasons": [], "Occupancy": "Unknown" }, { "Id": "voe:11003: :H:j24", "DlId": "de:vvo:11-3", "LineName": "3", "Direction": "Wilder Mann", "Platform": { "Name": "3", "Type": "Platform" }, "Mot": "Tram", "RealTime": "/Date(1703804700000-0000)/", "ScheduledTime": "/Date(1703804700000-0000)/", "State": "InTime", "RouteChanges": [ "19653" ], "Diva": { "Number": "11003", "Network": "voe" }, "CancelReasons": [], "Occupancy": "Unknown" } ]
// stationName.value = "Wörgl"
// loading.value = false

function refresh(done) {
  forceRefreshId++ // lets the "departure entry"-component know that it should be reloaded (update relative departure times)
  fetchDepartures()
  done()
}

function fetchDepartures() {
  api.post('/dm', {
          stopid: stationId.value,
          limit: 15,
          mot: [
            "Tram",
            "CityBus",
            "IntercityBus",
            "SuburbanRailway",
            "Train"
          ]
        })
      .then(async (response) => {
        if (response.data.Status.Code !== "Ok") {
          $q.notify({
            color: 'negative',
            message: 'An API error occurred',
            caption: response.data.Status.Message,
            icon: 'report_problem'
          })
        } else {
          departureData.value = response.data.Departures
          stationName.value = response.data.Name
          const stationData = stationsJson.features.filter(d => d.properties.id === stationId.value)
          if (stationData.length > 0) {
            stationAbbreviation.value = stationData[0].properties.abbreviation
          }

          await Preferences.set({
            key: stationId.value + "_offline",
            value: JSON.stringify({
              "departures": response.data.Departures,
              "name": response.data.Name,
              "lastDeparture": response.data.Departures[response.data.Departures.length-1].ScheduledTime
            })
          })
        }
        loading.value = false
      })
      .catch(async () => {
        const cachedData = await Preferences.get({key: stationId.value + "_offline"})
        const cachedStation = JSON.parse(cachedData.value)

        // only use cached data if it's still relevant
        if (cachedStation && dateFunctions.convertVVOToDate(cachedStation.lastDeparture) > Date.now()) {
          $q.notify({
            color: 'info',
            textColor: 'black',
            message: 'Cached data used for station',
            caption: 'No current data could be fetched from the VVO API',
            icon: 'download_for_offline'
          })
          departureData.value = cachedStation.departures
          stationName.value = cachedStation.name
        } else {
          $q.notify({
            color: 'negative',
            message: 'An error occurred fetching data from the VVO API',
            caption: 'No cached data was available for this station',
            icon: 'report_problem'
          })
        }
        loading.value = false
      })
}

if (stationId.value) {
  settingsFunctions.isBookmarked(stationId.value).then(response => {
    icon.value = response ? "bookmark" : "bookmark_border"
  })

  fetchDepartures()
}

async function bookmark() {
  const isBookmarked = await settingsFunctions.bookmark(stationId.value)
  icon.value = isBookmarked ? "bookmark" : "bookmark_border"
}
</script>
