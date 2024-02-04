<template>
  <q-select
    dense
    filled
    color="grey-10"
    bg-color="grey-2"
    :label="props.type === 'departures' ? 'Search for station' : 'Search for station or address'"
    clearable

    v-model="searchText"
    :options="options"
    option-value="id"
    option-label="name"
    ref="stationSelect"

    hide-selected
    fill-input
    use-input
    input-debounce="120"
    @filter="filterFn"
  >

<!-- TODO: show name+abbreviation when stop is selected, delete selection when on new search (hide-selected+fill-input have to be removed) -->
<!--      <template v-slot:selected-item="scope">-->
<!--        {{ scope.opt.name }} ( {{ scope.opt.abbreviation }} )-->
<!--      </template>-->

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label caption>{{ scope.opt.abbreviation }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:append>
      <q-btn flat round color="primary" icon="my_location" @click="getPosition()"/>
    </template>
  </q-select>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { Geolocation } from '@capacitor/geolocation';
import { geoFunctions } from 'stores/helperFunctions.js'
import { api } from 'boot/axios'

const $q = useQuasar()
const props = defineProps(['type'])
const options = ref([])
const stationSelect = ref(null)
const searchText = ref()

defineExpose({
  searchText
});

async function getPosition() {
  const coordinates = await Geolocation.getCurrentPosition()
  // const coordinates = {"coords": {"longitude": 13.737389107414138, "latitude": 51.053956030891435}} // dummy coordinates in central dresden (theaterplatz)

  const convertedCoordinates = await geoFunctions.convertCoordinates_WGS84_GK4( coordinates.coords.longitude, coordinates.coords.latitude)
  const searchQuery = "coord:"+convertedCoordinates[0]+":"+convertedCoordinates[1]

  api.post('tr/pointfinder', {
    query: searchQuery,
    limit: 10,
    assignedstops: true // if true ALSO returns stops that are nearby
  })
    .then((response) => {
      console.log(response.data.Status.Code)
      if(response.data.Status.Code !== "Ok" || response.data.PointStatus !== "Identified"){
        $q.notify({
          color: 'negative',
          message: 'An API error occurred',
          caption: response.data.Status.Message ?? "Location could not be identified or may be outside the VVO",
          icon: 'report_problem'
        })
      } else {
        options.value = [] // clear any previous searches
        const foundPoints = response.data.Points
        let regex = /(\d{8})\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/
        if (props.type === "connections") {
          // this regex will include address matches
          regex = /(?:(\d{8})\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?)|(?:(coord:.*)\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|)/;
        }
        foundPoints.forEach((point, i) => {
          const match = point.match(regex)
          if (match) {
            // match 1-3 belong to stations | matches 4-5 belong to addresses
            const stopId = match[1] ?? match[4] // if match is an address, its the 4th regex match
            const stopName = match[2] ?? match [5] // if match is an address, its the 5th regex match
            const stopAbbreviation = match[3] // only stations have abbreviations

            options.value.push({id: stopId, name: stopName, abbreviation: stopAbbreviation})

            if (i===1) {
              // the first (nearest) station gets automatically added to the search bar
              stationSelect.value.add({id: stopId, name: stopName, abbreviation: stopAbbreviation})
            }
          }
        })
      }
    })
    .catch((e) => {
      console.log("error while getting stations via gps location ", e)
      $q.notify({
        color: 'negative',
        message: 'An error occurred fetching data from the VVO API',
        icon: 'report_problem'
      })
    })
}

// if user searched ("filtered") for a station (search string with 3+ letters) show suggestions,
// if no search string was given: don't abort immediately to show GPS suggestions if there are any
function filterFn (val, update, abort) {
  if (val.length < 3) {
    update(() => {
      stationSelect.value.refresh() // not even necessary?
    })
    abort()
    return
  }

  update(() => {
    options.value = [] //empty the previous search results
    const searchTerm = val.toLowerCase()

    api.post('tr/pointfinder', {
      query: searchTerm,
      limit: 10,
      stopsOnly: props.type === "departures",
      regionalOnly: true,
      stopShortcuts: true
    })
      .then((response) => {
        if(response.data.Status.Code !== "Ok"){
          $q.notify({
            color: 'negative',
            message: 'An API error occurred',
            caption: response.data.Status.Message,
            icon: 'report_problem'
          })
        } else {
          const foundPoints = response.data.Points
          console.log(foundPoints)
          let regex = /(\d{8})\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/
          if (props.type === "connections") {
            // this regex will include address matches
            regex = /(\d{8}|^streetID:.*|^poiID:.*)\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/;
          }
          foundPoints.forEach((point) => {
            const match = point.match(regex)
            if (match[1] && match[2]) {
              const stopId = match[1]
              const stopName = match[2]
              const stopAbbreviation = match[3]
              options.value.push({id: stopId, name: stopName, abbreviation: stopAbbreviation})
            }
          })
        }
      //   loading.value = false
      })
      .catch((e) => {
        console.log("error for ", searchTerm, e)
        $q.notify({
          color: 'negative',
          message: 'An error occurred fetching data from the VVO API',
          icon: 'report_problem'
        })
      })
  })
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
