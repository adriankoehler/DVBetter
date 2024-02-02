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
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { dateFunctions, settingsFunctions } from "stores/helperFunctions";
import { Preferences } from "@capacitor/preferences";
import ConnectionEntry from 'components/ConnectionEntry.vue'

const $q = useQuasar()
const connectionData = ref(null)
const stationNameOrigin = ref("")
const stationAbbreviationOrigin = ref("")
const stationNameDestination = ref("")
const stationAbbreviationDestination = ref("")
const loading = ref(true)

const route = useRoute()
//f.e.: Hbf to Theaterplatz = "33000028-33000020" or "poiID:40001635:14627010:-1:Hänelpark:Coswig.| (bei Dresden):Hänelpark:ANY:POI:1511957:5354892:MRCV:VVO-33000020"
const connectionId = route.params.connectionId

// TODOLATER umbenennen
const stationIdOrigin = ref("")
const stationIdDestination = ref("")

// TODOLATER maybe include the correct number of | in the non-capturing groups
const regex = /(\d{8}|(?:streetID:.*)|(?:poiID:.*)|(?:coord:.*))-(\d{8}|(?:streetID:.*)|(?:poiID:.*)|(?:coord:.*))/
const match = connectionId.match(regex)
if (match[1] && match[2]) {
  stationIdOrigin.value = match[1] //f.e.: Hbf=33000028 or some poi/streetID string
  stationIdDestination.value = match[2]
}

const icon = ref("bookmark_border")

function fetchConnections() {
  api.post('/tr/trips?format=json', {
    origin: stationIdOrigin.value,
    destination: stationIdDestination.value,
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
        console.log(response);
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
    .catch(async (e) => {
      console.log(e)
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

async function getPointInfo (stationOrPointID) {
  let response = await api.post('tr/pointfinder', {
      query: stationOrPointID,
      limit: 1,
      regionalOnly: true,
      stopShortcuts: true
    })

  if(response.data.Status.Code !== "Ok"){
    $q.notify({
      color: 'negative',
      message: 'An API error occurred',
      caption: response.data.Status.Message,
      icon: 'report_problem'
    })
  } else {
    const foundPoints = response.data.Points
    // const regex = /(?:\d{8}|^streetID:.*|$|^poiID:.*|$)\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/;
    const regex = /(?:\d{8}|^streetID:.*|^poiID:.*|^coord:.*)\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/;

    const match = foundPoints[0].match(regex)
    console.log(match);
    if (match[0] && match[1]) {
      const name = match[1]
      const abbreviation = match[2] ?? ""
      return [name, abbreviation]
    } else {
      $q.notify({
      color: 'negative',
      message: 'An error occurred',
      caption: 'A point was returned but a name could not be fetched from the return value',
      icon: 'report_problem'
    })
    }
  }
  return ["/", ""] // in case of error, still return something (but "/" as name and no abbr.)
}

if (connectionId) {
  settingsFunctions.isBookmarked(connectionId).then(response => {
    icon.value = response ? "bookmark" : "bookmark_border"
  })

  getPointInfo(stationIdOrigin.value).then(response => {
    const stationDataOrigin = response
    stationNameOrigin.value = stationDataOrigin[0]
    stationAbbreviationOrigin.value = stationDataOrigin[1]
  })

  getPointInfo(stationIdDestination.value).then(response => {
    const stationDataDestination = response
    stationNameDestination.value = stationDataDestination[0]
    stationAbbreviationDestination.value = stationDataDestination[1]
  })

  fetchConnections()
}

async function bookmark() {
  const isBookmarked = await settingsFunctions.bookmark(connectionId)
  icon.value = isBookmarked ? "bookmark" : "bookmark_border"
}
</script>
