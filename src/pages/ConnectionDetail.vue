<template>
  <q-page>
    <div class="content-wrapper no-x-padding">
      <div class="row no-wrap">
        <h2 class="q-pl-std">
          <span> {{ stationNameOrigin }}</span>
          <span v-if="stationAbbreviationOrigin"> ({{ stationAbbreviationOrigin }})</span>
          <span> - </span>
          <span> {{ stationNameDestination }}</span>
          <span v-if="stationAbbreviationDestination"> ({{ stationAbbreviationDestination }})</span>
        </h2>
        <q-icon id="bookmark-station-icon" class="self-center cursor-pointer q-ml-auto q-pr-std" :name="icon" size="sm" @click="bookmark()"/>
      </div>
      <q-separator />
      <connection-entry
        v-for="connectionEntry in connectionData"
        :connection="connectionEntry"
        :key="connectionEntry.RouteId"
      />
    </div>
  </q-page>

  <q-inner-loading
        :showing=loading
        label="Fetching connections.."
        class="api_loading"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from "vue-router"
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import ConnectionEntry from 'components/ConnectionEntry.vue'
import stationsJson from "assets/stations_dresden.json"
import {dateFunctions, settingsFunctions} from "stores/helperFunctions";
import {Preferences} from "@capacitor/preferences";

const $q = useQuasar()
const connectionData = ref(null)
const stationNameOrigin = ref("")
const stationAbbreviationOrigin = ref("")
const stationNameDestination = ref("")
const stationAbbreviationDestination = ref("")
const loading = ref(true)

const route = useRoute()
const connectionId = route.params.connectionId //f.e.: Hbf to Theaterplatz = "33000028-33000020"
const stationIdOrigin = connectionId.substring(0, connectionId.indexOf("-")) //f.e.: Hbf=33000028
const stationIdDestination = connectionId.substring(connectionId.indexOf("-") + 1)

const icon = ref("bookmark_border")

// get the name and abbreviation for the stations from the stations json
const stationDataOrigin = stationsJson.features.filter(d => d.properties.id === stationIdOrigin)
if (stationDataOrigin.length > 0) {
  stationNameOrigin.value = stationDataOrigin[0].properties.name
  stationAbbreviationOrigin.value = stationDataOrigin[0].properties.abbreviation
}
const stationDataDestination = stationsJson.features.filter(d => d.properties.id === stationIdDestination)
if (stationDataDestination.length > 0) {
  stationNameDestination.value = stationDataDestination[0].properties.name
  stationAbbreviationDestination.value = stationDataDestination[0].properties.abbreviation
}

function fetchConnections() {
  api.post('/tr/trips?format=json', {
    origin: stationIdOrigin,
    destination: stationIdDestination,
    isarrivaltime: false,
    mobilitySettings: {
      mobilityRestriction: "None"
    },
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
    .then(async (response) => {
      if(response.data.Status.Code !== "Ok"){
        $q.notify({
          color: 'negative',
          message: 'An API error occurred',
          caption: response.data.Status.Message,
          icon: 'report_problem'
        })
      } else {
        connectionData.value = response.data.Routes

        await Preferences.set({
          key: connectionId + "_offline",
          value: JSON.stringify({
            "routes": response.data.Routes,
            "name": response.data.Name,
            "lastDeparture": connectionData.value[connectionData.value.length-1].PartialRoutes[0].RegularStops[0].DepartureTime
          })
        })
      }
      loading.value = false
    })
    .catch(async () => {
      const cachedData = await Preferences.get({key: connectionId + "_offline"})
      const cachedConnections = JSON.parse(cachedData.value)

      // only use cached data if it's still relevant
      if (cachedConnections && dateFunctions.convertVVOToDate(cachedConnections.lastDeparture) > Date.now()) {
        $q.notify({
          color: 'info',
          textColor: 'black',
          message: 'Cached data used for connections',
          caption: 'No current data could be fetched from the VVO API',
          icon: 'download_for_offline'
        })
        connectionData.value = cachedConnections.routes
      } else {
        $q.notify({
          color: 'negative',
          message: 'An error occurred fetching data from the VVO API',
          caption: 'No cached data was available for this connection',
          icon: 'report_problem'
        })
      }
      loading.value = false
    })
}

if (connectionId) {
  settingsFunctions.isBookmarked(connectionId).then(response => {
    icon.value = response ? "bookmark" : "bookmark_border"
  })

  fetchConnections()
}

async function bookmark() {
  const isBookmarked = await settingsFunctions.bookmark(connectionId)
  icon.value = isBookmarked ? "bookmark" : "bookmark_border"
}
</script>
